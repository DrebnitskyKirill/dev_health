"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStore = void 0;
const store = new Map();
exports.PaymentStore = {
    save(id, record) {
        store.set(id, { ...record, createdAt: new Date().toISOString() });
    },
    get(id) {
        return store.get(id);
    },
    update(id, updates) {
        const current = store.get(id);
        if (!current)
            return;
        store.set(id, { ...current, ...updates });
    },
};
