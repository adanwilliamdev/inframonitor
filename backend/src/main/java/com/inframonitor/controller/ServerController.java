package com.inframonitor.controller;

import com.inframonitor.model.Server;
import com.inframonitor.service.ServerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/servers")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ServerController {
    private final ServerService serverService;
    
    @GetMapping
    public ResponseEntity<List<Server>> getAllServers() {
        return ResponseEntity.ok(serverService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Server> getServer(@PathVariable Long id) {
        return ResponseEntity.ok(serverService.findById(id));
    }
    
    @PostMapping
    public ResponseEntity<Server> createServer(@RequestBody Server server) {
        return ResponseEntity.ok(serverService.create(server));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Server> updateServer(@PathVariable Long id, @RequestBody Server server) {
        return ResponseEntity.ok(serverService.update(id, server));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServer(@PathVariable Long id) {
        serverService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/metrics")
    public ResponseEntity<Server> updateMetrics(
            @PathVariable Long id,
            @RequestParam Double cpu,
            @RequestParam Double memory,
            @RequestParam Double disk,
            @RequestParam(required = false) Double networkIn,
            @RequestParam(required = false) Double networkOut) {
        return ResponseEntity.ok(serverService.updateMetrics(id, cpu, memory, disk, 
            networkIn != null ? networkIn : 0.0, 
            networkOut != null ? networkOut : 0.0));
    }
    
    @GetMapping("/alerts")
    public ResponseEntity<List<Server>> getAlerts() {
        return ResponseEntity.ok(serverService.getAlerts());
    }
}
