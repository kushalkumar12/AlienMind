package com.interviewtogether.domain;

import jakarta.persistence.*;

@Entity
public class CompanyProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private UserAccount user;

    @Column(nullable = false)
    private String companyName;

    private String hiringFocus;

    public CompanyProfile() {
    }

    public CompanyProfile(UserAccount user, String companyName, String hiringFocus) {
        this.user = user;
        this.companyName = companyName;
        this.hiringFocus = hiringFocus;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getHiringFocus() {
        return hiringFocus;
    }
}
