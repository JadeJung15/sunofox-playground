import { UserState, addPoints as authAddPoints, postEconomyAction, usePoints as authUsePoints } from './auth.js?v=8.5.0';

/**
 * SevenCheck 통합 데이터 관리자 (The Store)
 * 모든 포인트 지급, 아이템 획득 로직을 중앙 집중 관리하여 데이터 유실을 방지합니다.
 */
export const Store = {
    // 1. 안전한 포인트 지급
    async rewardPoints(amount, reason = '활동 보상') {
        if (!UserState.user) return false;
        try {
            // 중복 처리 방지 로직 (연타 방지)
            if (this._isProcessing) return false;
            this._isProcessing = true;

            const success = await authAddPoints(amount, reason);
            
            this._isProcessing = false;
            return success;
        } catch (e) {
            console.error("Store Error (Points):", e);
            this._isProcessing = false;
            return false;
        }
    },

    // 2. 안전한 포인트 사용 (아이템 구매 등)
    async spendPoints(amount) {
        if (!UserState.user || UserState.data.points < amount) {
            alert("포인트가 부족합니다. 💰");
            return false;
        }
        try {
            const success = await authUsePoints(amount);
            return success;
        } catch (e) {
            console.error("Store Error (Spend):", e);
            return false;
        }
    },

    // 3. 아이템 획득 및 인벤토리 저장
    async gainItem(itemName, itemValue = 500) {
        if (!UserState.user) return false;
        try {
            await postEconomyAction('grantItems', { items: [itemName] });
            
            // 로컬 데이터 즉시 갱신 (사용자 경험 향상)
            if (UserState.data) {
                UserState.data.inventory.push(itemName);
                UserState.data.totalScore += itemValue;
                UserState.data.discoveredItems = [...new Set([...(UserState.data.discoveredItems || []), itemName])];
            }
            return true;
        } catch (e) {
            console.error("Store Error (Item):", e);
            return false;
        }
    },

    _isProcessing: false
};
