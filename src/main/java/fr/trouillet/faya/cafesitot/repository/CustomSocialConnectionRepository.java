/*
 *
 *  * Copyright (c) 2017 dtrouillet
 *  * All rights reserved.
 *  *
 *  * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *  *
 *  *  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *  *  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *  *  Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *  *
 *  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

package fr.trouillet.faya.cafesitot.repository;

import fr.trouillet.faya.cafesitot.domain.SocialUserConnection;

import org.springframework.social.connect.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.stream.Collectors;

public class CustomSocialConnectionRepository implements ConnectionRepository {

    private String userId;

    private SocialUserConnectionRepository socialUserConnectionRepository;

    private ConnectionFactoryLocator connectionFactoryLocator;

    public CustomSocialConnectionRepository(String userId, SocialUserConnectionRepository socialUserConnectionRepository, ConnectionFactoryLocator connectionFactoryLocator) {
        this.userId = userId;
        this.socialUserConnectionRepository = socialUserConnectionRepository;
        this.connectionFactoryLocator = connectionFactoryLocator;
    }

    @Override
    public MultiValueMap<String, Connection<?>> findAllConnections() {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdOrderByProviderIdAscRankAsc(userId);
        List<Connection<?>> connections = socialUserConnectionsToConnections(socialUserConnections);
        MultiValueMap<String, Connection<?>> connectionsByProviderId = new LinkedMultiValueMap<>();
        Set<String> registeredProviderIds = connectionFactoryLocator.registeredProviderIds();
        for (String registeredProviderId : registeredProviderIds) {
            connectionsByProviderId.put(registeredProviderId, Collections.emptyList());
        }
        for (Connection<?> connection : connections) {
            String providerId = connection.getKey().getProviderId();
            if (connectionsByProviderId.get(providerId).size() == 0) {
                connectionsByProviderId.put(providerId, new LinkedList<>());
            }
            connectionsByProviderId.add(providerId, connection);
        }
        return connectionsByProviderId;
    }

    @Override
    public List<Connection<?>> findConnections(String providerId) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId);
        return socialUserConnectionsToConnections(socialUserConnections);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> List<Connection<A>> findConnections(Class<A> apiType) {
        List<?> connections = findConnections(getProviderId(apiType));
        return (List<Connection<A>>) connections;
    }

    @Override
    public MultiValueMap<String, Connection<?>> findConnectionsToUsers(MultiValueMap<String, String> providerUserIdsByProviderId) {
        if (providerUserIdsByProviderId == null || providerUserIdsByProviderId.isEmpty()) {
            throw new IllegalArgumentException("Unable to execute find: no providerUsers provided");
        }

        MultiValueMap<String, Connection<?>> connectionsForUsers = new LinkedMultiValueMap<>();
        for (Map.Entry<String, List<String>> entry : providerUserIdsByProviderId.entrySet()) {
            String providerId = entry.getKey();
            List<String> providerUserIds = entry.getValue();
            List<Connection<?>> connections = providerUserIdsToConnections(providerId, providerUserIds);
            connections.forEach(connection -> connectionsForUsers.add(providerId, connection));
        }
        return connectionsForUsers;
    }

    @Override
    public Connection<?> getConnection(ConnectionKey connectionKey) {
        SocialUserConnection socialUserConnection = socialUserConnectionRepository.findOneByUserIdAndProviderIdAndProviderUserId(userId, connectionKey.getProviderId(), connectionKey.getProviderUserId());
        return Optional.ofNullable(socialUserConnection)
            .map(this::socialUserConnectionToConnection)
            .orElseThrow(() -> new NoSuchConnectionException(connectionKey));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> Connection<A> getConnection(Class<A> apiType, String providerUserId) {
        String providerId = getProviderId(apiType);
        return (Connection<A>) getConnection(new ConnectionKey(providerId, providerUserId));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> Connection<A> getPrimaryConnection(Class<A> apiType) {
        String providerId = getProviderId(apiType);
        Connection<A> connection = (Connection<A>) findPrimaryConnection(providerId);
        if (connection == null) {
            throw new NotConnectedException(providerId);
        }
        return connection;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> Connection<A> findPrimaryConnection(Class<A> apiType) {
        String providerId = getProviderId(apiType);
        return (Connection<A>) findPrimaryConnection(providerId);
    }

    @Override
    @Transactional
    public void addConnection(Connection<?> connection) {
        Long rank = getNewMaxRank(connection.getKey().getProviderId()).longValue();
        SocialUserConnection socialUserConnectionToSave = connectionToUserSocialConnection(connection, rank);
        socialUserConnectionRepository.save(socialUserConnectionToSave);
    }

    @Override
    @Transactional
    public void updateConnection(Connection<?> connection) {
        SocialUserConnection socialUserConnection = socialUserConnectionRepository.findOneByUserIdAndProviderIdAndProviderUserId(userId, connection.getKey().getProviderId(), connection.getKey().getProviderUserId());
        if (socialUserConnection != null) {
            SocialUserConnection socialUserConnectionToUdpate =  connectionToUserSocialConnection(connection, socialUserConnection.getRank());
            socialUserConnectionToUdpate.setId(socialUserConnection.getId());
            socialUserConnectionRepository.save(socialUserConnectionToUdpate);
        }
    }

    @Override
    @Transactional
    public void removeConnections(String providerId) {
        socialUserConnectionRepository.deleteByUserIdAndProviderId(userId, providerId);
    }

    @Override
    @Transactional
    public void removeConnection(ConnectionKey connectionKey) {
        socialUserConnectionRepository.deleteByUserIdAndProviderIdAndProviderUserId(userId, connectionKey.getProviderId(), connectionKey.getProviderUserId());
    }

    private Double getNewMaxRank(String providerId) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId);
        return socialUserConnections.stream()
            .mapToDouble(SocialUserConnection::getRank)
            .max()
            .orElse(0D) + 1D;
    }

    private Connection<?> findPrimaryConnection(String providerId) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId);
        if (socialUserConnections.size() > 0) {
            return socialUserConnectionToConnection(socialUserConnections.get(0));
        } else {
            return null;
        }
    }

    private SocialUserConnection connectionToUserSocialConnection(Connection<?> connection, Long rank) {
        ConnectionData connectionData = connection.createData();
        return new SocialUserConnection(
            userId,
            connection.getKey().getProviderId(),
            connection.getKey().getProviderUserId(),
            rank,
            connection.getDisplayName(),
            connection.getProfileUrl(),
            connection.getImageUrl(),
            connectionData.getAccessToken(),
            connectionData.getSecret(),
            connectionData.getRefreshToken(),
            connectionData.getExpireTime()
        );
    }

    private List<Connection<?>> providerUserIdsToConnections(String providerId, List<String> providerUserIds) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdAndProviderUserIdIn(userId, providerId, providerUserIds);
        return socialUserConnectionsToConnections(socialUserConnections);
    }

    private List<Connection<?>> socialUserConnectionsToConnections(List<SocialUserConnection> socialUserConnections) {
        return socialUserConnections.stream()
            .map(this::socialUserConnectionToConnection)
            .collect(Collectors.toList());
    }

    private Connection<?> socialUserConnectionToConnection(SocialUserConnection socialUserConnection) {
        ConnectionData connectionData = new ConnectionData(socialUserConnection.getProviderId(),
            socialUserConnection.getProviderUserId(),
            socialUserConnection.getDisplayName(),
            socialUserConnection.getProfileURL(),
            socialUserConnection.getImageURL(),
            socialUserConnection.getAccessToken(),
            socialUserConnection.getSecret(),
            socialUserConnection.getRefreshToken(),
            socialUserConnection.getExpireTime());
        ConnectionFactory<?> connectionFactory = connectionFactoryLocator.getConnectionFactory(connectionData.getProviderId());
        return connectionFactory.createConnection(connectionData);
    }

    private <A> String getProviderId(Class<A> apiType) {
        return connectionFactoryLocator.getConnectionFactory(apiType).getProviderId();
    }
}
