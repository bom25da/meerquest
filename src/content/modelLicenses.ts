export interface ModelLicenseNotice {
  codeLicenseName: string;
  licenseName: string;
  localLicensePath: string;
  modelId: string;
  modelName: string;
  notice: string;
  obligations: string[];
  permitsCommercialUse: boolean;
  restrictedUseSummary: string[];
  sourceUrls: string[];
}

export const speechModelLicenseNotice: ModelLicenseNotice = {
  codeLicenseName: 'MIT',
  licenseName: 'OpenRAIL-M',
  localLicensePath: 'docs/licenses/supertonic3-openrail-m-license.txt',
  modelId: 'Supertone/supertonic-3',
  modelName: 'Supertonic 3',
  notice:
    'Supertonic 3의 모델 가중치와 ONNX 파일은 OpenRAIL-M 라이선스를 따르고, 제공되는 샘플 코드는 MIT 라이선스를 따릅니다. MeerQuest는 앱 내부 TTS 용도로 모델을 사용하며, 배포 시 아래 고지와 사용 제한을 함께 유지합니다.',
  obligations: [
    '모델 또는 파생물을 배포할 때 OpenRAIL-M 라이선스 사본을 함께 제공합니다.',
    '저작권, 특허, 상표, 출처 고지를 제거하지 않습니다.',
    '앱 약관과 운영 정책에 OpenRAIL-M의 사용 제한을 반영합니다.',
  ],
  permitsCommercialUse: true,
  restrictedUseSummary: [
    '불법 행위, 위해, 차별, 괴롭힘을 조장하는 용도로 사용하지 않습니다.',
    '동의 없는 사칭, 음성 복제, 기만적 딥페이크 용도로 사용하지 않습니다.',
    '미성년자에게 해로운 사용이나 연령에 맞지 않는 콘텐츠 생성에 사용하지 않습니다.',
  ],
  sourceUrls: [
    'https://huggingface.co/Supertone/supertonic-3',
    'https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE',
  ],
};
