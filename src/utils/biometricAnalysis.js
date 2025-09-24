// 생체데이터 분석 및 멘트 생성 유틸리티

// 기준값 정의
const BIOMETRIC_THRESHOLDS = {
  heartRate: {
    low: 60,
    high: 100,
    criticalLow: 50,
    criticalHigh: 120
  },
  oxygenSaturation: {
    low: 95,
    high: 98,
    criticalLow: 90,
    criticalHigh: 100
  },
  temperature: {
    low: 20,
    high: 30,
    criticalLow: 15,
    criticalHigh: 35
  },
  humidity: {
    low: 40,
    high: 70,
    criticalLow: 30,
    criticalHigh: 80
  }
};

// 심박수 분석
export const analyzeHeartRate = (bpm) => {
  if (bpm < BIOMETRIC_THRESHOLDS.heartRate.criticalLow) {
    return {
      status: 'critical',
      level: '위험',
      message: `심박수가 ${bpm}BPM으로 매우 낮습니다. 의료진 상담이 필요합니다.`,
      recommendation: '즉시 휴식을 취하고 의료진과 상담하세요.',
      color: '#E74C3C'
    };
  } else if (bpm < BIOMETRIC_THRESHOLDS.heartRate.low) {
    return {
      status: 'warning',
      level: '주의',
      message: `심박수가 ${bpm}BPM으로 정상보다 낮습니다.`,
      recommendation: '가벼운 운동이나 스트레칭을 권장합니다.',
      color: '#F39C12'
    };
  } else if (bpm > BIOMETRIC_THRESHOLDS.heartRate.criticalHigh) {
    return {
      status: 'critical',
      level: '위험',
      message: `심박수가 ${bpm}BPM으로 매우 높습니다. 과도한 스트레스나 운동 상태일 수 있습니다.`,
      recommendation: '휴식을 취하고 심호흡을 해보세요.',
      color: '#E74C3C'
    };
  } else if (bpm > BIOMETRIC_THRESHOLDS.heartRate.high) {
    return {
      status: 'warning',
      level: '주의',
      message: `심박수가 ${bpm}BPM으로 정상보다 높습니다.`,
      recommendation: '마음을 진정시키고 편안한 음악을 들어보세요.',
      color: '#F39C12'
    };
  } else {
    return {
      status: 'normal',
      level: '정상',
      message: `심박수가 ${bpm}BPM으로 정상 범위입니다.`,
      recommendation: '현재 상태가 양호합니다. 공연 관람에 적합합니다.',
      color: '#67C090'
    };
  }
};

// 산소포화도 분석
export const analyzeOxygenSaturation = (spo2) => {
  if (spo2 < BIOMETRIC_THRESHOLDS.oxygenSaturation.criticalLow) {
    return {
      status: 'critical',
      level: '위험',
      message: `산소포화도가 ${spo2}%로 매우 낮습니다. 즉시 의료진 상담이 필요합니다.`,
      recommendation: '신선한 공기를 마시고 즉시 의료진과 상담하세요.',
      color: '#E74C3C'
    };
  } else if (spo2 < BIOMETRIC_THRESHOLDS.oxygenSaturation.low) {
    return {
      status: 'warning',
      level: '주의',
      message: `산소포화도가 ${spo2}%로 정상보다 낮습니다.`,
      recommendation: '깊은 호흡을 하고 신선한 공기를 마셔보세요.',
      color: '#F39C12'
    };
  } else if (spo2 > BIOMETRIC_THRESHOLDS.oxygenSaturation.criticalHigh) {
    return {
      status: 'warning',
      level: '주의',
      message: `산소포화도가 ${spo2}%로 정상보다 높습니다.`,
      recommendation: '정상적인 범위이지만 지속적인 모니터링이 필요합니다.',
      color: '#F39C12'
    };
  } else {
    return {
      status: 'normal',
      level: '정상',
      message: `산소포화도가 ${spo2}%로 정상 범위입니다.`,
      recommendation: '호흡 상태가 양호합니다.',
      color: '#67C090'
    };
  }
};

// 체온 분석
export const analyzeTemperature = (temp) => {
  if (temp < BIOMETRIC_THRESHOLDS.temperature.criticalLow) {
    return {
      status: 'critical',
      level: '위험',
      message: `체온이 ${temp}°C로 매우 낮습니다. 저체온증 위험이 있습니다.`,
      recommendation: '따뜻한 곳으로 이동하고 따뜻한 음료를 섭취하세요.',
      color: '#E74C3C'
    };
  } else if (temp < BIOMETRIC_THRESHOLDS.temperature.low) {
    return {
      status: 'warning',
      level: '주의',
      message: `체온이 ${temp}°C로 정상보다 낮습니다.`,
      recommendation: '따뜻한 옷을 입고 따뜻한 음료를 마셔보세요.',
      color: '#F39C12'
    };
  } else if (temp > BIOMETRIC_THRESHOLDS.temperature.criticalHigh) {
    return {
      status: 'critical',
      level: '위험',
      message: `체온이 ${temp}°C로 매우 높습니다. 열사병 위험이 있습니다.`,
      recommendation: '시원한 곳으로 이동하고 충분한 수분을 섭취하세요.',
      color: '#E74C3C'
    };
  } else if (temp > BIOMETRIC_THRESHOLDS.temperature.high) {
    return {
      status: 'warning',
      level: '주의',
      message: `체온이 ${temp}°C로 정상보다 높습니다.`,
      recommendation: '시원한 곳에서 휴식을 취하고 수분을 충분히 섭취하세요.',
      color: '#F39C12'
    };
  } else {
    return {
      status: 'normal',
      level: '정상',
      message: `체온이 ${temp}°C로 정상 범위입니다.`,
      recommendation: '체온이 적절합니다.',
      color: '#67C090'
    };
  }
};

// 습도 분석
export const analyzeHumidity = (humidity) => {
  if (humidity < BIOMETRIC_THRESHOLDS.humidity.criticalLow) {
    return {
      status: 'critical',
      level: '위험',
      message: `습도가 ${humidity}%로 매우 낮습니다. 건조한 환경이 건강에 해로울 수 있습니다.`,
      recommendation: '가습기를 사용하거나 수분을 충분히 섭취하세요.',
      color: '#E74C3C'
    };
  } else if (humidity < BIOMETRIC_THRESHOLDS.humidity.low) {
    return {
      status: 'warning',
      level: '주의',
      message: `습도가 ${humidity}%로 정상보다 낮습니다. 건조한 환경입니다.`,
      recommendation: '가습기를 사용하거나 수분 섭취를 늘려보세요.',
      color: '#F39C12'
    };
  } else if (humidity > BIOMETRIC_THRESHOLDS.humidity.criticalHigh) {
    return {
      status: 'warning',
      level: '주의',
      message: `습도가 ${humidity}%로 매우 높습니다. 습한 환경이 불쾌할 수 있습니다.`,
      recommendation: '환기를 시키거나 제습기를 사용해보세요.',
      color: '#F39C12'
    };
  } else if (humidity > BIOMETRIC_THRESHOLDS.humidity.high) {
    return {
      status: 'warning',
      level: '주의',
      message: `습도가 ${humidity}%로 정상보다 높습니다.`,
      recommendation: '환기를 시키거나 적절한 습도 조절이 필요합니다.',
      color: '#F39C12'
    };
  } else {
    return {
      status: 'normal',
      level: '정상',
      message: `습도가 ${humidity}%로 적절한 범위입니다.`,
      recommendation: '환경이 쾌적합니다.',
      color: '#67C090'
    };
  }
};

// 전체 생체데이터 종합 분석
export const analyzeBiometricData = (data) => {
  const { analysis } = data;
  
  const heartRateAnalysis = analyzeHeartRate(analysis.avg_hr_bpm);
  const oxygenAnalysis = analyzeOxygenSaturation(analysis.avg_spo2_pct);
  const temperatureAnalysis = analyzeTemperature(analysis.avg_temperature_c);
  const humidityAnalysis = analyzeHumidity(analysis.avg_humidity_pct);
  
  // 전체 상태 결정
  const analyses = [heartRateAnalysis, oxygenAnalysis, temperatureAnalysis, humidityAnalysis];
  const criticalCount = analyses.filter(a => a.status === 'critical').length;
  const warningCount = analyses.filter(a => a.status === 'warning').length;
  
  let overallStatus, overallColor, overallMessage;
  
  if (criticalCount > 0) {
    overallStatus = 'critical';
    overallColor = '#E74C3C';
    overallMessage = '전체적으로 주의가 필요한 상태입니다. 의료진 상담을 권장합니다.';
  } else if (warningCount >= 2) {
    overallStatus = 'warning';
    overallColor = '#F39C12';
    overallMessage = '몇 가지 지표에서 주의가 필요합니다. 휴식을 취하시기 바랍니다.';
  } else if (warningCount === 1) {
    overallStatus = 'caution';
    overallColor = '#F39C12';
    overallMessage = '일부 지표에서 주의가 필요하지만 전반적으로 양호합니다.';
  } else {
    overallStatus = 'normal';
    overallColor = '#67C090';
    overallMessage = '모든 생체지표가 정상 범위입니다. 공연 관람에 적합한 상태입니다.';
  }
  
  return {
    overall: {
      status: overallStatus,
      color: overallColor,
      message: overallMessage
    },
    details: {
      heartRate: heartRateAnalysis,
      oxygenSaturation: oxygenAnalysis,
      temperature: temperatureAnalysis,
      humidity: humidityAnalysis
    }
  };
};

// 공연 추천 로직
export const getPerformanceRecommendation = (analysis) => {
  const { overall, details } = analysis;
  
  if (overall.status === 'critical') {
    return {
      recommendation: '의료진 상담 후 공연 관람을 권장합니다.',
      suitableGenres: [],
      message: '현재 상태로는 공연 관람을 권장하지 않습니다.'
    };
  } else if (overall.status === 'warning') {
    return {
      recommendation: '편안한 공연을 선택하시기 바랍니다.',
      suitableGenres: ['클래식', '뉴에이지', '명상음악'],
      message: '스트레스가 적은 편안한 공연을 추천합니다.'
    };
  } else if (overall.status === 'caution') {
    return {
      recommendation: '적당한 강도의 공연을 즐기실 수 있습니다.',
      suitableGenres: ['뮤지컬', '연극', '클래식'],
      message: '적당한 강도의 공연을 추천합니다.'
    };
  } else {
    return {
      recommendation: '모든 장르의 공연을 즐기실 수 있습니다.',
      suitableGenres: ['뮤지컬', '연극', '클래식', '콘서트', '댄스'],
      message: '현재 상태가 양호하여 모든 장르의 공연을 추천합니다.'
    };
  }
};

