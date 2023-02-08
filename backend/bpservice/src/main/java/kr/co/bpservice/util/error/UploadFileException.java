package kr.co.bpservice.util.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UploadFileException extends RuntimeException {
    private final ErrorCode errorCode;
}
