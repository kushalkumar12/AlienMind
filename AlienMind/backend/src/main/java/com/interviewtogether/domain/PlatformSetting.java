package com.interviewtogether.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.Instant;

@Entity
public class PlatformSetting {
    @Id
    @Column(name = "setting_key", nullable = false, length = 120)
    private String key;

    @Column(name = "setting_value", nullable = false, length = 2000)
    private String value;

    @Column(nullable = false)
    private Boolean publicSetting = true;

    @Column(name = "icon_data", length = 10000)
    private String iconData;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected PlatformSetting() {
    }

    public PlatformSetting(String key, String value, Boolean publicSetting) {
        this.key = key;
        this.value = value;
        this.publicSetting = publicSetting;
    }

    public PlatformSetting(String key, String value, Boolean publicSetting, String iconData) {
        this.key = key;
        this.value = value;
        this.publicSetting = publicSetting;
        this.iconData = iconData;
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }

    public Boolean getPublicSetting() {
        return publicSetting;
    }

    public String getIconData() {
        return iconData;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void update(String value, Boolean publicSetting) {
        this.value = value;
        this.publicSetting = publicSetting;
        this.updatedAt = Instant.now();
    }

    public void updateWithIcon(String value, Boolean publicSetting, String iconData) {
        this.value = value;
        this.publicSetting = publicSetting;
        this.iconData = iconData;
        this.updatedAt = Instant.now();
    }
}
