package com.minisiem.dto;

import lombok.*;
import java.time.*;
import java.util.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EndpointDetailDto {
    private EndpointDto endpoint;
    private List<AppDto> applications;
    private List<LoginHistoryDto> loginHistory;
    private List<CommandDto> commands;
    private List<BrowserHistoryDto> browserHistory;
}

@Data @AllArgsConstructor @NoArgsConstructor
public class AppDto { private UUID id; private String name, version, publisher; private LocalDate installDate; private Boolean isInstalled; }

@Data @AllArgsConstructor @NoArgsConstructor
public class LoginHistoryDto { private UUID id; private String username, loginType; private LocalDateTime loginTime, logoutTime; }

@Data @AllArgsConstructor @NoArgsConstructor
public class CommandDto { private UUID id; private String username, command; private LocalDateTime executedAt; }

@Data @AllArgsConstructor @NoArgsConstructor
public class BrowserHistoryDto { private UUID id; private String url, title; private LocalDateTime visitedAt; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IdentityAssetDto {
    private UUID id, endpointId; private String username, fullName, passwordStrength, endpointHostname;
    private LocalDateTime lastPasswordChange, forceResetAt; private Boolean forceResetRequested;
}