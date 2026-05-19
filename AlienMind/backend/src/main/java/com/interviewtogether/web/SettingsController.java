package com.interviewtogether.web;

import com.interviewtogether.domain.PlatformSetting;
import com.interviewtogether.repository.PlatformSettingRepository;
import com.interviewtogether.web.dto.AdminSettingResponse;
import com.interviewtogether.web.dto.SettingRequest;
import com.interviewtogether.web.dto.UpdateSettingRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final PlatformSettingRepository settings;

    public SettingsController(PlatformSettingRepository settings) {
        this.settings = settings;
    }

    @GetMapping("/public")
    public Map<String, String> publicSettings() {
        return settings.findByPublicSettingTrue().stream()
                .collect(Collectors.toMap(PlatformSetting::getKey, PlatformSetting::getValue));
    }

    @GetMapping
    public Map<String, String> allSettings() {
        return settings.findAll().stream()
                .collect(Collectors.toMap(PlatformSetting::getKey, PlatformSetting::getValue));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<AdminSettingResponse>> adminAllSettings() {
        List<AdminSettingResponse> settingsList = settings.findAll().stream()
                .map(s -> new AdminSettingResponse(
                        s.getKey(),
                        s.getValue(),
                        s.getPublicSetting(),
                        s.getIconData(),
                        s.getUpdatedAt().toEpochMilli()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(settingsList);
    }

    @PutMapping("/{key}")
    public PlatformSetting upsert(@PathVariable String key, @Valid @RequestBody SettingRequest request) {
        PlatformSetting setting = settings.findById(key)
                .orElseGet(() -> new PlatformSetting(key, request.value(), request.publicSetting()));
        setting.update(request.value(), request.publicSetting());
        return settings.save(setting);
    }

    @PutMapping("/admin/{key}")
    public ResponseEntity<AdminSettingResponse> adminUpdate(
            @PathVariable String key,
            @Valid @RequestBody UpdateSettingRequest request) {
        PlatformSetting setting = settings.findById(key)
                .orElseGet(
                        () -> new PlatformSetting(key, request.value(), request.publicSetting(), request.iconData()));
        setting.updateWithIcon(request.value(), request.publicSetting(), request.iconData());
        PlatformSetting saved = settings.save(setting);

        AdminSettingResponse response = new AdminSettingResponse(
                saved.getKey(),
                saved.getValue(),
                saved.getPublicSetting(),
                saved.getIconData(),
                saved.getUpdatedAt().toEpochMilli());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/{key}")
    public ResponseEntity<Void> adminDelete(@PathVariable String key) {
        if (settings.existsById(key)) {
            settings.deleteById(key);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
