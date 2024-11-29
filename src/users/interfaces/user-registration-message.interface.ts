/**
 * 사용자 등록 이벤트 메시지 인터페이스
 * Kafka를 통해 수신되는 메시지의 구조를 정의합니다.
 */
export interface UserRegistrationMessage {
  /**
   * 사용자 이메일 주소
   */
  email: string;

  /**
   * 사용자 닉네임
   */
  nickname: string;
}
