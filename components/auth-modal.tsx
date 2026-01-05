"use client"

import type React from "react"

import { useState } from "react"
import { X, User, Lock, Shield, Key, CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"
import { authService } from "@/lib/auth"

interface AuthModalProps {
  isOpen: boolean
  mode: "login" | "register"
  onClose: () => void
  onModeChange: (mode: "login" | "register") => void
  onAuthSuccess?: () => void
}

export function AuthModal({ isOpen, mode, onClose, onModeChange, onAuthSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [userType, setUserType] = useState<"user" | "organizer">("user")
  const [authCode, setAuthCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (mode === "login") {
        const { data, error } = await authService.login(email, password)
        if (error) {
          setErrorMessage(getErrorMessage(error))
          return
        }
        setSuccessMessage("登录成功！")
        setTimeout(() => {
          onClose()
          onAuthSuccess?.()
        }, 1500)
      } else {
        if (userType === "organizer" && !authCode) {
          setErrorMessage("请输入负责人认证码")
          setLoading(false)
          return
        }
        const { data, error } = await authService.register(email, password, username, userType, authCode)
        if (error) {
          setErrorMessage(getErrorMessage(error))
          return
        }
        setSuccessMessage("注册成功！")
        setTimeout(() => {
          onClose()
          onAuthSuccess?.()
        }, 3000)
      }
    } catch (error) {
      setErrorMessage("操作失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (error: any) => {
    if (typeof error === "string") {
      return error
    }
    
    if (error?.message) {
      const message = error.message
      
      if (message.includes("活动负责人必须提供认证码")) {
        return "活动负责人必须提供认证码"
      }
      if (message.includes("认证码无效或已被使用")) {
        return "认证码无效或已被使用"
      }
      if (message.includes("请输入负责人认证码")) {
        return "请输入负责人认证码"
      }
      if (message.includes("请输入认证码")) {
        return "请输入认证码"
      }
      if (message.includes("认证码")) {
        return message
      }
      if (message.includes("User already registered")) {
        return "该邮箱已被注册"
      }
      if (message.includes("Invalid login credentials")) {
        return "邮箱或密码错误"
      }
      if (message.includes("Email not confirmed")) {
        return "请先验证邮箱"
      }
      if (message.includes("Database error saving new user")) {
        return "注册失败，请检查认证码是否正确"
      }
      
      return message
    }
    
    return "操作失败，请稍后重试"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(45, 42, 38, 0.4)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--amber-100)" }}>
              {mode === "login" ? (
                <User className="w-8 h-8" style={{ color: "var(--amber-600)" }} />
              ) : (
                <Shield className="w-8 h-8" style={{ color: "var(--amber-600)" }} />
              )}
            </div>
            <h2 className="text-2xl font-semibold mb-2 font-serif text-foreground">
              {mode === "login" ? "欢迎回来" : "加入拾光志"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "登录以继续你的校园之旅" : "开启你的拾光之旅"}
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 shadow-md" style={{ backgroundColor: "var(--teal-50)", border: "1px solid var(--teal-200)" }}>
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--teal-600)" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--teal-700)" }}>{successMessage}</p>
                {mode === "register" && <p className="text-xs mt-1" style={{ color: "var(--teal-600)" }}>请查收邮箱中的验证邮件</p>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入你的邮箱"
                  className="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                  disabled={loading}
                />
              </div>
            </div>
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">用户类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("user")}
                    className={`p-3 rounded-xl text-sm transition-all border ${
                      userType === "user" 
                        ? "border-amber-500 bg-amber-50 shadow-md" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      <span>普通用户</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("organizer")}
                    className={`p-3 rounded-xl text-sm transition-all border ${
                      userType === "organizer" 
                        ? "border-amber-500 bg-amber-50 shadow-md" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>活动负责人</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
            {mode === "register" && userType === "organizer" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">认证码</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="请输入负责人认证码"
                    className="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">负责人需要提供正确的认证码才能注册</p>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl flex items-start gap-3 shadow-md" style={{ backgroundColor: "var(--red-50)", border: "1px solid var(--red-200)" }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--destructive)" }} />
                <p className="text-sm" style={{ color: "var(--destructive)" }}>{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: "var(--amber-600)" }}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
            </button>
          </form>

          {!successMessage && (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{mode === "login" ? "还没有账户？" : "已有账户？"}</span>
              <button
                onClick={() => onModeChange(mode === "login" ? "register" : "login")}
                className="font-medium ml-1"
                style={{ color: "var(--amber-600)" }}
                disabled={loading}
              >
                {mode === "login" ? "立即注册" : "立即登录"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
