/**
 * components/login/VisitorMenu.tsx (헤더 우측 방문자/로그인 위젯)
 * ================================================================================
 * 상단 헤더 오른쪽에 표시되는 방문자 표시 + 로그인/로그아웃 버튼.
 * - 비로그인: "visitor" 라벨 + [로그인] 버튼(누르면 회선 선택 모달).
 * - 로그인:  로그인된 회선ID/고객명 라벨 + [로그아웃] 버튼(누르면 식별자 초기화·익명 복귀).
 * 로그인/로그아웃의 실제 식별자 주입·오퍼 갱신은 VisitorContext 가 담당한다.
 *
 * [Main Functions]
 * ===========
 * - VisitorMenu: 방문자 라벨 + 로그인/로그아웃 버튼 + LoginModal 토글
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - VisitorMenu()
 *
 * [Dependencies]
 * =========
 * - react-native (Pressable, Text, View)
 * - @/context/VisitorContext (useVisitorLine, useVisitorLogout)
 * - ./LoginModal
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useVisitorLine, useVisitorLogout } from "@/context/VisitorContext";
import LoginModal from "./LoginModal";

// 1. 헤더 우측 위젯: 로그인 여부에 따라 라벨·버튼을 전환하고 모달을 토글한다.
export default function VisitorMenu(): React.ReactElement {
  const line = useVisitorLine();
  const logout = useVisitorLogout();
  const [modalOpen, setModalOpen] = useState(false);
  const loggedIn = !!line;

  return (
    <View style={s.wrap}>
      <View style={s.labelWrap}>
        <Text style={s.role}>{loggedIn ? "로그인" : "visitor"}</Text>
        {loggedIn ? (
          <Text style={s.who} numberOfLines={1}>
            {line?.lineId} · {line?.customerName}
          </Text>
        ) : null}
      </View>
      {loggedIn ? (
        <Pressable onPress={() => void logout()} style={[s.btn, s.btnOut]}>
          <Text style={s.btnOutText}>로그아웃</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => setModalOpen(true)} style={[s.btn, s.btnIn]}>
          <Text style={s.btnInText}>로그인</Text>
        </Pressable>
      )}
      <LoginModal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center" },
  labelWrap: { alignItems: "flex-end", marginRight: 8, maxWidth: 150 },
  role: { color: "rgba(255,255,255,0.8)", fontSize: 10, lineHeight: 12 },
  who: { color: "#fff", fontSize: 12, fontWeight: "700" },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnIn: { backgroundColor: "#fff" },
  btnInText: { color: "#4A90D9", fontWeight: "700", fontSize: 13 },
  btnOut: { borderWidth: 1, borderColor: "rgba(255,255,255,0.8)" },
  btnOutText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
