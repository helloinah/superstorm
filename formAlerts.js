// formAlerts.js

document.addEventListener('DOMContentLoaded', function() {
    // 각 오류 메시지 ID에 대한 사용자 정의 알림 메시지
    const customAlertMessages = {
        'stb_name_error': "이름을 입력해주세요",
        'stb_email_error': "이메일을 입력해주세요",
        'stb_policy_error': "약관 동의가 필요합니다"
        // 'stb_ad_agreement_error' 및 'stb_form_result'는 div의 실제 내용을 알림으로 표시합니다.
    };

    // 특정 div를 관찰하고 내용 변경 시 알림을 띄우는 함수
    const observeDivContent = (divId) => {
        const targetNode = document.getElementById(divId);
        if (targetNode) {
            const observer = new MutationObserver(function(mutationsList) {
                for (const mutation of mutationsList) {
                    // 텍스트 내용이 변경되었는지 확인
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const currentText = targetNode.innerText.trim();
                        if (currentText !== '') {
                            // 사용자 정의 메시지가 있으면 사용하고, 없으면 div의 실제 내용을 사용
                            const message = customAlertMessages[divId] || currentText;
                            alert(message);
                            // 알림이 뜬 후 div의 내용을 지워서 같은 내용으로 다시 알림이 뜨는 것을 방지
                            targetNode.innerText = '';
                        }
                    }
                }
            });

            // 자식 노드의 추가/삭제(childList) 및 텍스트 데이터 변경(characterData)을 관찰합니다.
            // subtree: true는 자식 노드 내부의 변경까지 감지합니다.
            observer.observe(targetNode, { childList: true, subtree: true, characterData: true });

            // 초기 로드 시 이미 내용이 있을 경우에도 알림을 띄웁니다.
            const initialText = targetNode.innerText.trim();
            if (initialText !== '') {
                const message = customAlertMessages[divId] || initialText;
                alert(message);
                targetNode.innerText = ''; // 초기 알림 후 내용 지우기
            }

        } else {
            console.warn(`[formAlerts.js] Element with ID '${divId}' not found for observation.`);
        }
    };

    // 감시할 div ID들을 호출
    observeDivContent('stb_name_error');
    observeDivContent('stb_email_error');
    observeDivContent('stb_policy_error');
    observeDivContent('stb_ad_agreement_error');
    observeDivContent('stb_form_result');

    // 참고: test.html에는 stb_form_msg_success와 stb_form_msg_error (일반 메시지용)도 있지만
    // 현재 구현에서는 id가 없으므로 직접 관찰하기 어렵습니다.
    // 만약 해당 div들도 팝업을 띄우고 싶다면 id를 추가해야 합니다.
});