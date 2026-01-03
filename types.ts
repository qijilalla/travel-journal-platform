export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  isAdmin?: boolean; // New field for admin privileges
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  location: string;
  date: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  likes: string[]; // Array of User IDs
  comments: Comment[];
  isPrivate: boolean; // New field for visibility
}

export type Language = 'en' | 'cn';

export interface Translation {
  title: string;
  subtitle: string;
  createButton: string;
  uploadImage: string;
  placeholderTitle: string;
  placeholderLocation: string;
  placeholderContent: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  loading: string;
  noEntries: string;
  locationLabel: string;
  dateLabel: string;
  imageLabel: string;
  // Auth & Social
  login: string;
  register: string;
  logout: string;
  myJournals: string;
  adminDashboard: string; // New
  allJournals: string;
  likes: string;
  comments: string;
  addComment: string;
  loginToAction: string;
  username: string;
  password: string;
  signInDesc: string;
  welcomeBack: string;
  joinUs: string;
  readMore: string;
  adminHint: string; // New
  // Privacy
  backToList: string;
  visibilityLabel: string;
  privateLabel: string;
  publicLabel: string;
  privateBadge: string;
  // Demo
  quickLogin: string;
  adminRole: string;
  userRole: string;
}

export const DICTIONARY: Record<Language, Translation> = {
  en: {
    title: "TRAVEL JOURNAL",
    subtitle: "Cloud Native Azure Platform",
    createButton: "New Entry",
    uploadImage: "Upload Photo",
    placeholderTitle: "Where did you go?",
    placeholderLocation: "City, Country",
    placeholderContent: "Write about your adventure...",
    save: "Publish",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading from Azure...",
    noEntries: "No journals found.",
    locationLabel: "Location",
    dateLabel: "Date",
    imageLabel: "Cover Image",
    login: "Sign In",
    register: "Register",
    logout: "Sign Out",
    myJournals: "My Dashboard",
    adminDashboard: "Admin Console",
    allJournals: "Global Feed",
    likes: "Likes",
    comments: "Comments",
    addComment: "Add a comment...",
    loginToAction: "Please sign in to interact.",
    username: "Username",
    password: "Password",
    signInDesc: "Access your curated travel memories.",
    welcomeBack: "Welcome Back",
    joinUs: "Join the Community",
    readMore: "Read Story",
    adminHint: "Or enter credentials manually below.",
    backToList: "Back to Journal",
    visibilityLabel: "Visibility",
    privateLabel: "Private Memory (Only Me)",
    publicLabel: "Public Story",
    privateBadge: "Private",
    quickLogin: "Quick Demo Access",
    adminRole: "Administrator",
    userRole: "Traveler"
  },
  cn: {
    title: "旅行日记平台",
    subtitle: "Azure 云原生架构演示",
    createButton: "新建日记",
    uploadImage: "上传照片",
    placeholderTitle: "你去哪儿了？",
    placeholderLocation: "城市，国家",
    placeholderContent: "记录你的冒险经历...",
    save: "发布",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    loading: "正在从 Azure 加载...",
    noEntries: "暂无日记。",
    locationLabel: "地点",
    dateLabel: "日期",
    imageLabel: "封面图片",
    login: "登录",
    register: "注册",
    logout: "登出",
    myJournals: "我的空间",
    adminDashboard: "管理员后台",
    allJournals: "探索",
    likes: "点赞",
    comments: "评论",
    addComment: "写下你的评论...",
    loginToAction: "请先登录以进行操作。",
    username: "用户名",
    password: "密码",
    signInDesc: "访问您的专属旅行记忆。",
    welcomeBack: "欢迎回来",
    joinUs: "加入社区",
    readMore: "阅读全文",
    adminHint: "或在下方手动输入凭证。",
    backToList: "返回列表",
    visibilityLabel: "可见性",
    privateLabel: "私密日记 (仅自己可见)",
    publicLabel: "公开日记",
    privateBadge: "私密",
    quickLogin: "快速演示通道",
    adminRole: "管理员",
    userRole: "普通用户"
  }
};