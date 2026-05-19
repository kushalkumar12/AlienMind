package com.interviewtogether.repository;

import com.interviewtogether.domain.PlatformSetting;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {
    List<PlatformSetting> findByPublicSettingTrue();
}
