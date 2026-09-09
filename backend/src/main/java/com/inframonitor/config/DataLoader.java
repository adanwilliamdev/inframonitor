package com.inframonitor.config;

import com.inframonitor.model.Server;
import com.inframonitor.model.ServerStatus;
import com.inframonitor.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {
    private final ServerRepository serverRepository;
    
    @Override
    public void run(String... args) {
        if (serverRepository.count() == 0) {
            log.info("📊 Populando dados iniciais...");
            
            Server server1 = Server.builder()
                .name("WebServer-01")
                .ipAddress("192.168.1.10")
                .description("Servidor Web Principal")
                .location("Data Center SP")
                .operatingSystem("Ubuntu 22.04")
                .cpuUsage(45.5)
                .memoryUsage(62.3)
                .diskUsage(35.8)
                .networkIn(125.5)
                .networkOut(89.2)
                .status(ServerStatus.ONLINE)
                .lastCheck(LocalDateTime.now())
                .build();
            
            Server server2 = Server.builder()
                .name("Database-01")
                .ipAddress("192.168.1.20")
                .description("Servidor de Banco de Dados")
                .location("Data Center SP")
                .operatingSystem("CentOS 8")
                .cpuUsage(78.2)
                .memoryUsage(85.1)
                .diskUsage(42.3)
                .networkIn(200.5)
                .networkOut(150.8)
                .status(ServerStatus.DEGRADED)
                .lastCheck(LocalDateTime.now())
                .build();
            
            Server server3 = Server.builder()
                .name("AppServer-01")
                .ipAddress("192.168.1.30")
                .description("Servidor de Aplicações")
                .location("Data Center RJ")
                .operatingSystem("Windows Server 2022")
                .cpuUsage(23.7)
                .memoryUsage(45.2)
                .diskUsage(28.5)
                .networkIn(45.3)
                .networkOut(32.1)
                .status(ServerStatus.ONLINE)
                .lastCheck(LocalDateTime.now())
                .build();
            
            Server server4 = Server.builder()
                .name("Backup-01")
                .ipAddress("192.168.1.40")
                .description("Servidor de Backup")
                .location("Data Center RJ")
                .operatingSystem("Debian 11")
                .cpuUsage(12.5)
                .memoryUsage(25.8)
                .diskUsage(88.5)
                .networkIn(15.2)
                .networkOut(8.7)
                .status(ServerStatus.ONLINE)
                .lastCheck(LocalDateTime.now())
                .build();
            
            serverRepository.save(server1);
            serverRepository.save(server2);
            serverRepository.save(server3);
            serverRepository.save(server4);
            
            log.info("✅ Dados iniciais carregados com sucesso!");
        }
    }
}
