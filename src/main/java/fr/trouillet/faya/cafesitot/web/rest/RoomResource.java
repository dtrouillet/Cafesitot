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

package fr.trouillet.faya.cafesitot.web.rest;

import com.codahale.metrics.annotation.Timed;
import fr.trouillet.faya.cafesitot.domain.Room;
import fr.trouillet.faya.cafesitot.repository.RoomRepository;
import fr.trouillet.faya.cafesitot.web.rest.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;
import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing rooms.
 */
@RestController
@RequestMapping("/api")
public class RoomResource {

    private final Logger log = LoggerFactory.getLogger(RoomResource.class);

    private final RoomRepository roomRepository;

    public RoomResource(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    /**
     * GET  /rooms : get all rooms.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and with body all rooms
     */
    @GetMapping("/rooms")
    @Timed
    public ResponseEntity<List<Room>> getAllRooms(@ApiParam Pageable pageable) {
        final Page<Room> page = roomRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/rooms");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /rooms/:id : get the "id" room.
     *
     * @param id the id of the room to find
     * @return the ResponseEntity with status 200 (OK) and with body the "id" room, or with status 404 (Not Found)
     */
    @GetMapping("/rooms/{id}")
    @Timed
    public ResponseEntity<Room> getRoom(@PathVariable Long id) {
        log.debug("REST request to get Room : {}", id);
        return ResponseUtil.wrapOrNotFound(roomRepository.findById(id));
    }
}
