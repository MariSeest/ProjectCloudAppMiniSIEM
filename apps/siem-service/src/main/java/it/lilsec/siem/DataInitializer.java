package it.lilsec.siem;

import it.lilsec.siem.entity.Alert;
import it.lilsec.siem.entity.SiemEvent;
import it.lilsec.siem.repository.AlertRepository;
import it.lilsec.siem.repository.SiemEventRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final String TENANT = "00000000-0000-0000-0000-000000000002";
    private final AlertRepository alertRepo;
    private final SiemEventRepository eventRepo;

    public DataInitializer(AlertRepository alertRepo, SiemEventRepository eventRepo) {
        this.alertRepo = alertRepo;
        this.eventRepo = eventRepo;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedAlerts();
        seedEvents();
    }

    private void seedAlerts() {
        if (alertRepo.count() > 0) return;

        String[][] data = {
            {"Brute Force Attack Detected", "CRITICAL", "OPEN", "FALXDR Agent",
                "Multiple failed login attempts on SRV-DC01 from 192.168.1.105. 47 attempts in 5 minutes."},
            {"Suspicious PowerShell Execution", "HIGH", "OPEN", "FALXDR Agent",
                "Encoded PowerShell command executed on WKSTN-001 by user john.doe."},
            {"Lateral Movement Detected", "HIGH", "ACK", "Correlation Engine",
                "Abnormal SMB connections between WKSTN-001 and SRV-DC01 outside business hours."},
            {"Malware Signature Detected", "CRITICAL", "OPEN", "FALXDR Agent",
                "Known ransomware signature detected in C:\\Users\\Temp\\update.exe on WKSTN-042."},
            {"Data Exfiltration Attempt", "HIGH", "RESOLVED", "Network Monitor",
                "Large data transfer (2.3 GB) to external IP 185.220.101.45 from SRV-DC01."},
            {"Privilege Escalation Attempt", "MEDIUM", "ACK", "FALXDR Agent",
                "User luisa.mele attempted to access admin shares on SRV-DC01."},
            {"Anomalous Login Time", "MEDIUM", "RESOLVED", "Alert Engine",
                "User admin logged in at 03:47 AM from IP 10.0.0.55."},
            {"CVE-2024-39174 Exploitation Attempt", "HIGH", "OPEN", "Threat Intel Feed",
                "Exploitation attempt for CVE-2024-39174 detected against vulnerability-service:8081."},
            {"DNS Tunneling Detected", "MEDIUM", "ACK", "Network Monitor",
                "Unusual DNS query patterns from WKSTN-042, possible C2 communication."},
            {"Unauthorized USB Device", "LOW", "RESOLVED", "FALXDR Agent",
                "Unknown USB storage device connected to WKSTN-001 by user john.doe at 14:32."},
        };

        LocalDateTime base = LocalDateTime.now().minusDays(3);
        for (int i = 0; i < data.length; i++) {
            Alert a = new Alert();
            a.setTitle(data[i][0]);
            a.setSeverity(data[i][1]);
            a.setStatus(data[i][2]);
            a.setSource(data[i][3]);
            a.setDescription(data[i][4]);
            a.setTenantId(TENANT);
            a.setCreatedAt(base.plusHours(i * 7L));
            a.setUpdatedAt(base.plusHours(i * 7L + 1));
            alertRepo.save(a);
        }
    }

    private void seedEvents() {
        if (eventRepo.count() > 0) return;

        String[][] data = {
            {"Failed Login Attempt", "AUTH", "HIGH", "WKSTN-001", "192.168.1.105",
                "User admin failed login attempt #47"},
            {"PowerShell Script Executed", "PROCESS", "HIGH", "WKSTN-001", "192.168.1.101",
                "powershell.exe -EncodedCommand JABX..."},
            {"SMB Connection Established", "NETWORK", "MEDIUM", "WKSTN-001", "192.168.1.101",
                "Outbound SMB connection to SRV-DC01:445"},
            {"File Created in Temp Directory", "FILE", "MEDIUM", "WKSTN-042", "192.168.1.142",
                "C:\\Users\\Temp\\update.exe created by SYSTEM"},
            {"Large Outbound Transfer", "NETWORK", "HIGH", "SRV-DC01", "192.168.1.10",
                "2.3 GB transfer to 185.220.101.45:443"},
            {"Admin Share Access Attempt", "AUTH", "MEDIUM", "SRV-DC01", "192.168.1.10",
                "Unauthorized access attempt to ADMIN$ by luisa.mele"},
            {"Off-Hours Login", "AUTH", "LOW", "WKSTN-001", "192.168.1.101",
                "User admin authenticated at 03:47 from 10.0.0.55"},
            {"HTTP Request to Known Malicious URL", "NETWORK", "HIGH", "WKSTN-042", "192.168.1.142",
                "GET http://185.220.101.45/payload.bin"},
            {"DNS Query Anomaly", "NETWORK", "MEDIUM", "WKSTN-042", "192.168.1.142",
                "Unusual DNS TXT query: abc123.malware.c2.net"},
            {"USB Device Connected", "DEVICE", "LOW", "WKSTN-001", "192.168.1.101",
                "USB Mass Storage Device VID:0951 PID:1666 connected"},
            {"Registry Key Modified", "REGISTRY", "MEDIUM", "SRV-DC01", "192.168.1.10",
                "HKLM\\SOFTWARE\\Microsoft\\Windows\\Run modified"},
            {"Service Installed", "PROCESS", "HIGH", "SRV-DC01", "192.168.1.10",
                "New service svchost32 installed by SYSTEM"},
        };

        LocalDateTime base = LocalDateTime.now().minusDays(5);
        for (int i = 0; i < data.length; i++) {
            SiemEvent e = new SiemEvent();
            e.setTitle(data[i][0]);
            e.setCategory(data[i][1]);
            e.setSeverity(data[i][2]);
            e.setSource(data[i][3]);
            e.setSourceIp(data[i][4]);
            e.setDescription(data[i][5]);
            e.setTenantId(TENANT);
            e.setTimestamp(base.plusHours(i * 10L));
            e.setCreatedAt(base.plusHours(i * 10L));
            eventRepo.save(e);
        }
    }
}