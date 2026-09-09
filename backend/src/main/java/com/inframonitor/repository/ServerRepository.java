package com.inframonitor.repository;

import com.inframonitor.model.Server;
import com.inframonitor.model.ServerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {
    List<Server> findByStatus(ServerStatus status);
    List<Server> findByCpuUsageGreaterThan(Double threshold);
    List<Server> findByMemoryUsageGreaterThan(Double threshold);
}
