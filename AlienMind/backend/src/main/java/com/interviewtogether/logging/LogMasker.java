package com.interviewtogether.logging;

import java.util.Set;

public class LogMasker {
    private static final Set<String> SENSITIVE_FIELDS = Set.of(
        "password", "token", "authorization", "secret", "key", "cvv", "creditcard"
    );

    /**
     * Returns a masked version of the value if the key is sensitive.
     */
    public static String mask(String key, String value) {
        if (value == null) return null;
        if (key != null && SENSITIVE_FIELDS.contains(key.toLowerCase())) {
            return "******";
        }
        return value;
    }
    
    /**
     * Basic string masking for generic sensitive content.
     */
    public static String maskSensitive(String content) {
        if (content == null) return null;
        return content.replaceAll("(?i)(password|token|secret|authorization)=[^&\\s]+", "$1=******");
    }
}
