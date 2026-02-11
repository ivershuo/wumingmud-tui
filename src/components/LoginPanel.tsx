import { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useStore } from '../store'
import { AuthRequestError, login, register } from '../services/auth'
import { beginTrace, logError, shortTraceId } from '../services/logger'

type LoginMode = 'login' | 'register'
type LoginField = 'username' | 'password' | 'name' | 'confirmPassword'

export const LoginPanel = () => {
  const [mode, setMode] = useState<LoginMode>('login')
  const [activeField, setActiveField] = useState<LoginField>('username')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [traceHint, setTraceHint] = useState('')
  const { setAuthenticated, setPlayer } = useStore()

  const fieldsByMode: Record<LoginMode, LoginField[]> = {
    login: ['username', 'password'],
    register: ['username', 'password', 'name', 'confirmPassword'],
  }

  const cycleField = (reverse = false) => {
    const fields = fieldsByMode[mode]
    const currentIndex = fields.indexOf(activeField)
    const index = currentIndex < 0 ? 0 : currentIndex
    const nextIndex = reverse
      ? (index - 1 + fields.length) % fields.length
      : (index + 1) % fields.length
    setActiveField(fields[nextIndex])
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setActiveField('username')
    setError('')
    setTraceHint('')
  }

  useInput((_, key) => {
    if (key.tab) {
      cycleField(!!key.shift)
    }

    if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
      toggleMode()
    }
  })

  const handleSubmit = async () => {
    setError('')
    setTraceHint('')
    setLoading(true)
    const traceId = beginTrace()

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('请输入角色名')
          return
        }
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致')
          return
        }
      }

      if (!username.trim() || !password.trim()) {
        setError('请输入用户名和密码')
        return
      }

      const result = mode === 'login'
        ? await login({ username, password })
        : await register({ username, password, name })

      if (result.success && result.data) {
        setPlayer(result.data.player as any)
        setAuthenticated(true)
      } else {
        setError(result.error || result.message || '操作失败')
      }
    } catch (err) {
      if (err instanceof AuthRequestError) {
        setTraceHint(shortTraceId(err.traceId))
        switch (err.kind) {
          case 'network':
            setError('网络连接失败，请确认服务已启动')
            break
          case 'http':
            setError(`服务错误(${err.statusCode || '-'})，请稍后重试`)
            break
          case 'parse':
            setError('服务响应异常，请查看服务端日志')
            break
          case 'auth':
            setError(err.message || '认证失败，请检查账号密码')
            break
          default:
            setError(err.message || '请求失败')
        }
      } else {
        setError('未知错误，请稍后重试')
      }
      logError('auth.ui.submit_failed', err, {
        trace_id: traceId,
        phase: 'auth_http',
        mode,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center"
      height="100%"
    >
      <Box marginBottom={2}>
        <Text bold color="yellow">欢迎来到 无名江湖</Text>
      </Box>

      <Box marginBottom={1}>
        <Text 
          color={mode === 'login' ? 'white' : 'gray'}
          backgroundColor={mode === 'login' ? 'blue' : undefined}
        >
          {' [登录] '}
        </Text>
        <Text> </Text>
        <Text 
          color={mode === 'register' ? 'white' : 'gray'}
          backgroundColor={mode === 'register' ? 'blue' : undefined}
        >
          {' [注册] '}
        </Text>
        <Text color="gray"> (方向键切换模式)</Text>
      </Box>

      <Box flexDirection="column" width={40}>
        <Box marginBottom={1}>
          <Text color="gray">用户名: </Text>
          <TextInput
            value={username}
            onChange={setUsername}
            focus={activeField === 'username'}
            onSubmit={() => setActiveField('password')}
          />
        </Box>

        <Box marginBottom={1}>
          <Text color="gray">密码:   </Text>
          <TextInput
            value={password}
            onChange={setPassword}
            mask="*"
            focus={activeField === 'password'}
            onSubmit={() => {
              if (mode === 'login') {
                void handleSubmit()
              } else {
                setActiveField('name')
              }
            }}
          />
        </Box>

        {mode === 'register' && (
          <>
            <Box marginBottom={1}>
              <Text color="gray">角色名: </Text>
              <TextInput
                value={name}
                onChange={setName}
                focus={activeField === 'name'}
                onSubmit={() => setActiveField('confirmPassword')}
              />
            </Box>

            <Box marginBottom={1}>
              <Text color="gray">确认密码:</Text>
              <TextInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                mask="*"
                focus={activeField === 'confirmPassword'}
                onSubmit={() => {
                  void handleSubmit()
                }}
              />
            </Box>
          </>
        )}

        {error && (
          <Box marginBottom={1}>
            <Text color="red">
              {error}
              {traceHint ? ` (trace:${traceHint})` : ''}
            </Text>
          </Box>
        )}

        {loading && (
          <Box marginBottom={1}>
            <Text color="yellow">处理中...</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text color="gray">Enter 确认 | Tab 切输入框 | 方向键切换登录/注册 | Ctrl+C 退出</Text>
        </Box>
      </Box>
    </Box>
  )
}
