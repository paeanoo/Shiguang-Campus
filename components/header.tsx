"use client"

interface HeaderProps {
  onOpenLogin: () => void
  onOpenRegister: () => void
  onNavigate: (page: string) => void
  currentUser?: any
}

export function Header({ onOpenLogin, onOpenRegister, onNavigate, currentUser }: HeaderProps) {
  const handleLogout = async () => {
    const { authService } = await import("@/lib/auth")
    await authService.logout()
    window.location.reload()
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(253, 251, 247, 0.8)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="text-xl font-semibold tracking-wide font-serif text-foreground hover:opacity-80 transition-opacity"
        >
          拾光志
        </button>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-sm text-muted-foreground">
                {currentUser.username || currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                登录
              </button>
              <button
                onClick={onOpenRegister}
                className="text-sm font-medium text-white rounded-full px-5 py-2 transition-colors"
                style={{ backgroundColor: "var(--amber-600)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--amber-700)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--amber-600)")}
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
