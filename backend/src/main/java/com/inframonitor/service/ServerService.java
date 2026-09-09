package com.inframonitor.service;

import com.inframonitor.model.Server;
import com.inframonitor.model.ServerStatus;
import com.inframonitor.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServerService {
    private final ServerRepository serverRepository;
    
    public List<Server> findAll() {
        return serverRepository.findAll();
    }
    
    public Server findById(Long id) {
        return serverRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Server not found"));
    }
    
    @Transactional
    public Server create(Server server) {
        server.setCreatedAt(LocalDateTime.now());
        server.setUpdatedAt(LocalDateTime.now());
        server.setLastCheck(LocalDateTime.now());
        server.setStatus(ServerStatus.ONLINE);
        return serverRepository.save(server);
    }
    
    @Transactional
    public Server update(Long id, Server serverDetails) {
        Server server = findById(id);
        server.setName(serverDetails.getName());
        server.setIpAddress(serverDetails.getIpAddress());
        server.setDescription(serverDetails.getDescription());
        server.setLocation(serverDetails.getLocation());
        server.setOperatingSystem(serverDetails.getOperatingSystem());
        server.setUpdatedAt(LocalDateTime.now());
        return serverRepository.save(server);
    }
    
    @Transactional
    public void delete(Long id) {
        serverRepository.deleteById(id);
    }
    
    @Transactional
    public Server updateMetrics(Long id, Double cpu, Double memory, Double disk, Double networkIn, Double networkOut) {
        Server server = findById(id);
        server.setCpuUsage(cpu);
        server.setMemoryUsage(memory);
        server.setDiskUsage(disk);
        server.setNetworkIn(networkIn);
        server.setNetworkOut(networkOut);
        server.setLastCheck(LocalDateTime.now());
        
        if (cpu > 90 || memory > 90) {
            server.setStatus(ServerStatus.DEGRADED);
        } else if (cpu > 0 && memory > 0) {
            server.setStatus(ServerStatus.ONLINE);
        }
        
        return serverRepository.save(server);
    }
    
    public List<Server> getAlerts() {
        List<Server> byCpu = serverRepository.findByCpuUsageGreaterThan(85.0);
        List<Server> byMemory = serverRepository.findByMemoryUsageGreaterThan(85.0);
        return java.util.stream.Stream.concat(byCpu.stream(), byMemory.stream())
            .distinct()
            .toList();
    }
}
