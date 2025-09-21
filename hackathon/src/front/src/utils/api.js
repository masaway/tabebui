const API_BASE_URL = '/api'

// APIリクエスト用のユーティリティ関数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// ユーザー関連API
export const userAPI = {
  // ユーザー作成または更新
  createOrUpdateUser: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Google IDでユーザー取得
  getUserByGoogleId: async (googleId) => {
    return apiRequest(`/users/${googleId}`)
  },
}

// 部位関連API
export const partsAPI = {
  // 全部位取得
  getAllParts: async (animalType = null, partCategory = null) => {
    const params = new URLSearchParams()
    if (animalType) params.append('animal_type', animalType)
    if (partCategory) params.append('part_category', partCategory)

    const queryString = params.toString()
    const endpoint = queryString ? `/animal-parts?${queryString}` : '/animal-parts'

    return apiRequest(endpoint)
  },

  // 動物別部位取得
  getPartsByAnimal: async (animalType, partCategory = null) => {
    const params = new URLSearchParams()
    if (partCategory) params.append('part_category', partCategory)

    const queryString = params.toString()
    const endpoint = queryString
      ? `/animal-parts/${animalType}?${queryString}`
      : `/animal-parts/${animalType}`

    return apiRequest(endpoint)
  },
}

// 記録関連API
export const recordAPI = {
  // 食事記録作成
  createRecord: async (recordData, userId) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/eating-records?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(recordData),
    })
  },

  // 食事セッション一覧取得
  getSessions: async (userId, page = 1, perPage = 20) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/eating-sessions?user_id=${userId}&page=${page}&per_page=${perPage}`)
  },

  // 食事セッション詳細取得
  getSessionDetail: async (sessionId, userId) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/eating-sessions/${sessionId}?user_id=${userId}`)
  },
}

// 進捗関連API
export const progressAPI = {
  // ユーザー進捗取得
  getUserProgress: async (userId) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/user-progress?user_id=${userId}`)
  },

  // 動物別進捗取得
  getUserProgressByAnimal: async (animalType, userId) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/user-progress/${animalType}?user_id=${userId}`)
  },

  // ダッシュボード統計取得
  getDashboardStats: async (userId) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/dashboard-stats?user_id=${userId}`)
  },
}

// チャット関連API
export const chatAPI = {
  // チャットメッセージ送信
  sendMessage: async (message, userId, history = [], systemPrompt = null) => {
    if (!userId) throw new Error('User ID is required')
    return apiRequest(`/chat/message?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
        system_prompt: systemPrompt,
      }),
    })
  },
}