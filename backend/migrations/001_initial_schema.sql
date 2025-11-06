-- ==========================================
-- 노선 및 스케줄 관리 시스템 - 초기 스키마
-- Version: 1.2 (개선버전)
-- ==========================================

-- 데이터베이스 생성 (이미 존재하는 경우 주석 처리)
-- CREATE DATABASE IF NOT EXISTS routeinfo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE routeinfo;

-- ==========================================
-- 1. 정거장 및 승하차장 관리
-- ==========================================

-- 정거장 테이블
CREATE TABLE IF NOT EXISTS stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '정거장 고유 ID',
    name VARCHAR(100) NOT NULL COMMENT '정거장명',
    primary_stop_id INT NULL COMMENT '대표(주) 승하차장 ID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 가능 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='정거장 정보';

-- 승하차장 테이블
CREATE TABLE IF NOT EXISTS stops (
    stop_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '승하차장 고유 ID',
    station_id INT NOT NULL COMMENT '소속 정거장 ID',
    name VARCHAR(100) NOT NULL COMMENT '승하차장명',
    address VARCHAR(255) COMMENT '주소 정보',
    latitude DECIMAL(10, 7) NOT NULL COMMENT '위도 좌표',
    longitude DECIMAL(10, 7) NOT NULL COMMENT '경도 좌표',
    description TEXT COMMENT '설명 정보',
    photo_url VARCHAR(255) COMMENT '업로드된 사진 URL',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 가능 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE,
    INDEX idx_station (station_id),
    INDEX idx_location (latitude, longitude),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='승하차장 정보';

-- 정거장 테이블에 외래키 추가 (순환 참조 해결)
ALTER TABLE stations
    ADD CONSTRAINT fk_stations_primary_stop
    FOREIGN KEY (primary_stop_id) REFERENCES stops(stop_id) ON DELETE SET NULL;

-- ==========================================
-- 2. 노선 정보 및 속성 관리
-- ==========================================

-- 노선 테이블
CREATE TABLE IF NOT EXISTS routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '노선 고유 ID',
    name VARCHAR(100) NOT NULL COMMENT '노선명',
    group_name VARCHAR(100) COMMENT '그룹명 (선택값)',
    description TEXT COMMENT '노선 설명',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 가능 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_name (name),
    INDEX idx_group (group_name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='노선 정보';

-- 노선 속성 마스터 테이블
CREATE TABLE IF NOT EXISTS route_attributes (
    attr_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '속성 고유 ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '속성명 (ex: 입국, 출근)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 상태 (활성/비활성)',
    is_display BOOLEAN DEFAULT TRUE COMMENT '사용자 페이지 노출 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='노선 속성 마스터';

-- 노선-속성 연결 테이블
CREATE TABLE IF NOT EXISTS route_route_attributes (
    route_id INT NOT NULL COMMENT '노선 ID',
    attr_id INT NOT NULL COMMENT '속성 ID',
    PRIMARY KEY (route_id, attr_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    FOREIGN KEY (attr_id) REFERENCES route_attributes(attr_id) ON DELETE CASCADE,
    INDEX idx_route (route_id),
    INDEX idx_attr (attr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='노선-속성 연결';

-- 노선 구성 테이블
CREATE TABLE IF NOT EXISTS route_stops (
    route_stop_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '노선 구성 순번 ID',
    route_id INT NOT NULL COMMENT '노선 ID',
    stop_id INT NOT NULL COMMENT '승하차장 ID',
    sequence INT NOT NULL COMMENT '노선 내 정거장 순서',
    travel_time_min INT COMMENT '이전 정거장으로부터 소요 시간 (분)',
    distance_m INT COMMENT '이전 정거장으로부터 소요 거리 (미터)',
    stop_purpose ENUM('ON', 'OFF', 'ON_OFF', 'REF') NOT NULL COMMENT '정류장 속성 (승차/하차/승하차/참조)',
    is_blocked BOOLEAN DEFAULT FALSE COMMENT '임시 사용 중지 (블락) 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
    UNIQUE KEY uk_route_sequence (route_id, sequence),
    INDEX idx_route (route_id),
    INDEX idx_stop (stop_id),
    INDEX idx_sequence (route_id, sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='노선 구성 정보';

-- ==========================================
-- 3. 스케줄 관리
-- ==========================================

-- 스케줄 테이블
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '스케줄 고유 ID',
    route_id INT NOT NULL COMMENT '적용 노선 ID',
    start_date DATE NOT NULL COMMENT '운영 시작일',
    end_date DATE NOT NULL COMMENT '운영 종료일',
    schedule_type ENUM('REGULAR', 'ONCE') NOT NULL COMMENT '스케줄 유형 (정기/단발)',
    days_of_week VARCHAR(20) COMMENT '운영 요일 (JSON 또는 비트마스크: 1234567 = 월화수목금토일)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 가능 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    INDEX idx_route (route_id),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='스케줄 정보';

-- 회차별 시간 정보 테이블
CREATE TABLE IF NOT EXISTS schedule_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '회차 상세 ID',
    schedule_id INT NOT NULL COMMENT '스케줄 ID',
    trip_number INT NOT NULL COMMENT '회차 번호',
    departure_time TIME NOT NULL COMMENT '기점 출발 시간',
    arrival_time TIME COMMENT '종점 예상 도착 시간 (자동 계산)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 가능 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_schedule (schedule_id),
    INDEX idx_trip_number (schedule_id, trip_number),
    INDEX idx_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회차별 시간 정보';

-- ==========================================
-- 4. 사용자 페이지 관리
-- ==========================================

-- 사용자 페이지 테이블
CREATE TABLE IF NOT EXISTS user_pages (
    page_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '페이지 고유 ID',
    title VARCHAR(100) NOT NULL COMMENT '페이지 타이틀 값',
    slug VARCHAR(100) NOT NULL UNIQUE COMMENT '페이지 고유 URL/슬러그',
    selected_group VARCHAR(100) COMMENT '선택된 그룹명 (그룹 전체 선택 시)',
    attribute_for_tab_id INT COMMENT '노선 구분(탭)으로 사용할 속성 ID',
    custom_html TEXT COMMENT 'HTML 에디터로 입력된 추가 정보',
    is_public BOOLEAN DEFAULT TRUE COMMENT '공개/비공개 설정',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 가능 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (attribute_for_tab_id) REFERENCES route_attributes(attr_id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 페이지 관리';

-- 페이지-노선 연결 테이블
CREATE TABLE IF NOT EXISTS user_page_routes (
    page_route_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '연결 고유 ID',
    page_id INT NOT NULL COMMENT '페이지 ID',
    route_id INT NOT NULL COMMENT '페이지에 노출할 노선 ID',
    display_order INT COMMENT '노출 순서 (향후 확장용)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    FOREIGN KEY (page_id) REFERENCES user_pages(page_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    UNIQUE KEY uk_page_route (page_id, route_id),
    INDEX idx_page (page_id),
    INDEX idx_route (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='페이지-노선 연결';

-- ==========================================
-- 5. 초기 데이터 삽입 (샘플)
-- ==========================================

-- 노선 속성 초기 데이터
INSERT INTO route_attributes (name, is_active, is_display) VALUES
('입국', TRUE, TRUE),
('출근', TRUE, TRUE),
('퇴근', TRUE, TRUE);
