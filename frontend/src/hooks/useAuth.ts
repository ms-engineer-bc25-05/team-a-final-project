"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import firebase from "firebase/compat/app";
import { unsubscribe } from "diagnostics_channel";

/**
 * Firebase Authentication の認証状態を監視するカスタムフック
 * - ログインしている場合：user情報を返す
 * - 未ログインの場合：nullを返す
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebaseのログイン状態の変化を監視
        const unsubscribe = onAuthStateChanged(auth,(firebaseUser) => {
            setUser(firebaseUser); // ログイン中なら　userに設定
            setLoading(false);     // 監視が終わったらローディング解除
        });

        // クリーンアップ関数
        return () => unsubscribe();
    }, []);

    return { user, loading};
 
}