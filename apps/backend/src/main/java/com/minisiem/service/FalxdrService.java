package com.minisiem.service;

import com.minisiem.dto.*;
import com.minisiem.entity.*;
import com.minisiem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class FalxdrService {
    private final FalxdrEndpointRepository endpointRepository;
    private final FalxdrApplicationRepository appRepository;
    private final FalxdrLoginHistoryRepository loginRepository;
    private final FalxdrCommandRepository commandRepository;
    private final FalxdrBrowserHistoryRepository browserRepository;

    public List<EndpointDto> getEndpoints(UUID tenantId) {
        return endpointRepository.findAllByTenantIdOrderByHostname(tenantId).stream().map(this::toDto).toList();
    }

    public EndpointDetailDto getEndpointDetail(UUID id) {
        var ep = endpointRepository.findById(id).orElseThrow();
        return EndpointDetailDto.builder()
            .endpoint(toDto(ep))
            .applications(appRepository.findAllByEndpointIdAndIsInstalledTrue(id).stream()
                .map(a -> new AppDto(a.getId(), a.getName(), a.getVersion(), a.getPublisher(), a.getInstallDate(), a.getIsInstalled())).toList())
            .loginHistory(loginRepository.findAllByEndpointIdOrderByLoginTimeDesc(id).stream()
                .map(l -> new LoginHistoryDto(l.getId(), l.getUsername(), l.getLoginType(), l.getLoginTime(), l.getLogoutTime())).toList())
            .commands(commandRepository.findAllByEndpointIdOrderByExecutedAtDesc(id).stream()
                .map(c -> new CommandDto(c.getId(), c.getUsername(), c.getCommand(), c.getExecutedAt())).toList())
            .browserHistory(browserRepository.findTop20ByEndpointIdOrderByVisitedAtDesc(id).stream()
                .map(b -> new BrowserHistoryDto(b.getId(), b.getUrl(), b.getTitle(), b.getVisitedAt())).toList())
            .build();
    }

    @Transactional
    public void installApp(UUID endpointId, String appName) {
        var ep = endpointRepository.findById(endpointId).orElseThrow();
        appRepository.save(FalxdrApplication.builder().endpoint(ep).name(appName).version("latest").publisher("Manual Install").isInstalled(true).build());
    }

    @Transactional
    public void removeApp(UUID endpointId, UUID appId) {
        appRepository.findById(appId).ifPresent(a -> { a.setIsInstalled(false); appRepository.save(a); });
    }

    public List<Map<String,String>> discoverAssets(UUID tenantId) {
        String[] ips={"192.168.1.101","192.168.1.102","192.168.1.103","192.168.2.10","10.0.0.5"};
        String[] names={"LAPTOP-GUEST","PRINTER-FLOOR2","IOT-SENSOR-01","NAS-STORAGE","VPN-CLIENT"};
        String[] macs={"CC:DD:EE:FF:00:01","CC:DD:EE:FF:00:02","CC:DD:EE:FF:00:03","CC:DD:EE:FF:00:04","CC:DD:EE:FF:00:05"};
        var list = new ArrayList<Map<String,String>>();
        for (int i=0;i<ips.length;i++) {
            list.add(Map.of("id",UUID.randomUUID().toString(),"ip",ips[i],"hostname",names[i],"mac",macs[i],"agentInstalled","false"));
        }
        return list;
    }

    private EndpointDto toDto(FalxdrEndpoint e) {
        return EndpointDto.builder().id(e.getId()).hostname(e.getHostname()).ipAddress(e.getIpAddress())
            .macAddress(e.getMacAddress()).os(e.getOs()).osVersion(e.getOsVersion())
            .hardwareModel(e.getHardwareModel()).cpu(e.getCpu()).ramGb(e.getRamGb()).diskGb(e.getDiskGb())
            .agentVersion(e.getAgentVersion()).agentStatus(e.getAgentStatus()).lastSeen(e.getLastSeen()).build();
    }
}

@Service @RequiredArgsConstructor
class IdentityService {
    private final IdentityAssetRepository identityAssetRepository;
    private final AuditService auditService;

    public List<IdentityAssetDto> getAll(UUID tenantId) {
        return identityAssetRepository.findAllByTenantIdOrderByPasswordStrengthAsc(tenantId).stream().map(this::toDto).toList();
    }

    @Transactional
    public IdentityAssetDto forceReset(UUID id, UUID userId, String username, String ip) {
        var asset = identityAssetRepository.findById(id).orElseThrow();
        asset.setForceResetRequested(true);
        asset.setForceResetAt(LocalDateTime.now());
        auditService.log(username, userId, asset.getTenant().getId(), "FORCE_PASSWORD_RESET",
            "IDENTITY", id, Map.of("username", asset.getUsername()), ip);
        return toDto(identityAssetRepository.save(asset));
    }

    private IdentityAssetDto toDto(IdentityAsset a) {
        return IdentityAssetDto.builder().id(a.getId()).username(a.getUsername()).fullName(a.getFullName())
            .passwordStrength(a.getPasswordStrength()).lastPasswordChange(a.getLastPasswordChange())
            .forceResetRequested(a.getForceResetRequested()).forceResetAt(a.getForceResetAt())
            .endpointId(a.getEndpoint() != null ? a.getEndpoint().getId() : null)
            .endpointHostname(a.getEndpoint() != null ? a.getEndpoint().getHostname() : null).build();
    }
}