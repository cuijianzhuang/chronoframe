# ChronoFrame i18n Audit

Generated during an i18n remediation pass. The app uses `@nuxtjs/i18n` with locale files in
`i18n/locales/{en,ja,zh-Hans,zh-Hant-TW,zh-Hant-HK}.json`, accessed via `$t('key')` (templates)
and `t('key')` / `i18n.t('key')` (scripts).

There are two classes of problems:

- **Key-level bugs** in the locale JSON (broken/missing keys, casing, incomplete locales).
- **Hardcoded strings** in source never wired to i18n (~150 spots, largely hardcoded **Chinese**, so
  untranslatable for English/Japanese users).

`server/` uses zero i18n; server responses are not localized by design and are out of scope.

---

## A. Broken keys — referenced in code but unresolved (raw key shown to users)

| Key | Status | Used in |
|---|---|---|
| `dashboard.photos.messages.taskStatusCheckFailed` | missing in ALL locales | `app/pages/dashboard/photos.vue` |
| `dashboard.photos.messages.taskSubmitFailed` | missing in ALL locales | `app/pages/dashboard/photos.vue` |
| `dashboard.photos.messages.uploadFailed` | missing in ALL locales | `app/pages/dashboard/photos.vue` |
| `ui.action.backtotop.ariaLabel` | missing in ALL locales | `masonry/Root.vue`, `albums/[albumId].vue` |
| `ui.loading` | missing in ALL locales | `albums/[albumId].vue`, `layouts/masonry.vue` |
| `dashboard.albums.form.isHidden` | only in `zh-Hans` | `dashboard/albums.vue` |
| `dashboard.albums.form.isHiddenHint` | only in `zh-Hans` | `dashboard/albums.vue` |
| `title.storageSettings` | only in `zh-Hans` | `layouts/dashboard.vue`, `settings/storage.vue` |
| `title.systemSettings` | only in `zh-Hans` | `layouts/dashboard.vue`, `settings/system.vue` |

Bonus: `auth.form.errors.invalidPassword` exists in `en.json` but is an **empty string** `""`.

## B. Casing bug

`zh-Hant-TW.json` defines `ui.action.backToTop` (camelCase); every other locale and all code use
`ui.action.backtotop`. The zh-Hant-TW tooltip never resolves. Fix: rename to `backtotop`.

## C. Locale parity gaps (post casing-fix; canonical key count = 813)

| Locale | Missing |
|---|---|
| `en` | 4 (`dashboard.albums.form.isHidden`, `…isHiddenHint`, `title.storageSettings`, `title.systemSettings`) + empty `invalidPassword` |
| `zh-Hans` | 0 |
| `ja` | 39 |
| `zh-Hant-TW` | 39 |
| `zh-Hant-HK` | 39 |

The 39 keys missing from `ja` / `zh-Hant-TW` / `zh-Hant-HK` (identical set):

```
auth.form.action.backToHome
auth.form.errors.invalidEmail
auth.form.errors.invalidPassword
common.unknown
dashboard.albums.form.isHidden
dashboard.albums.form.isHiddenHint
dashboard.photos.slideover.options.duplicateCheck.{label,descriptionEnabled,descriptionDisabled,enabled,disabled,currentMode}
title.storageSettings
title.systemSettings
ui.indexPanelCountCity
upload.duplicate.block.{title,message,suggestion}
upload.duplicate.skip.{title,message,info}
upload.duplicate.warn.{title,message,warning,info}
upload.success.upload.{single,multiple}
upload.success.check.{title,message}
upload.error.required.{title,message}
upload.error.invalidType.{title,message,suggestion}
upload.error.tooLarge.{title,message,suggestion}
upload.error.uploadFailed.{title,message}
```

## D. Hardcoded strings not wired to i18n (~150 spots)

Worst offenders are hardcoded **Chinese** (broken for non-zh users).

### Pages
- **`dashboard/settings/storage.vue`** (~28): section descriptions, all column headers, every form
  label/placeholder, all toast titles (`设置已保存`, `保存设置时出错`, `存储方案已创建`, `创建存储方案时出错`,
  `存储方案已删除`, `删除存储方案失败`), modal text, provider option labels (`AWS S3 兼容存储`, `本地存储`),
  buttons (`重置`, `保存设置`, `取消`, `继续`, `添加存储`, `创建存储`, `删除`, `变更存储方案`, `选择存储方案`,
  `存储名称`, `存储类型`, `选择存储类型`, `当前默认存储`, `存储方案`, `存储方案管理`, `创建存储方案`, `注意`).
- **`dashboard/logs.vue`** (~15): `{{ connectionStatus }}` is rendered directly and its values are Chinese
  literals (`正在连接...`, `加载历史日志...`, `实时`, `连接错误`) — also used as a sentinel via
  `connectionStatus.value.includes('实时')` (logic must be refactored to a state enum). Placeholders
  (`搜索日志内容...`, `过滤级别`, `筛选 Tag`), empty states (`等待日志数据...`, `没有匹配的日志条目`),
  labels (`总条数/展示:`, `Tag:`), aria-label `Clear search input`.
- **`dashboard/settings/{general,map,privacy,system}.vue`**: repeated `重置` / `保存设置` buttons + a Chinese
  section description per page.
- **`dashboard/index.vue`**: `Share Your Site`, `分享你的站点`, `memory info not available`.
- **`dashboard/albums.vue`**: `张` count suffix.
- **`dashboard/photos.vue`**: aria-labels `Select all`/`Select row`, alt `Photo Thumbnail`, `Untitled`,
  `Photo Preview`, and three referenced-but-missing message keys (see A).
- **`dashboard/queue.vue`**: toast descriptions (`清除了 N 个任务`, `清理任务失败`, `重试了 N 个任务`,
  `批量重试失败`, `删除任务失败`), aria-label `Expand`, `队列任务列表`, detail labels `PhotoId`/`Payload`.
- **`albums/[albumId].vue`**: `Album not found`/`Album Not Found`, `Created: …` tooltip, Chinese fallbacks
  `'回到顶部'` on backtotop tooltip/aria-label, `ui.loading` (`LOADING`).
- **`albums/index.vue`**: alt fallback `Photo`.
- **`[...slug].vue`**: OG image headline `PHOTO`.
- **`signin.vue`**: `GitHub` (proper noun — low priority).

### Layouts
- **`layouts/dashboard.vue`**: `Please login to view dashboard`, `Sorry, you do not have access to this page.`,
  `Sign In`, nav `Documentation` (GitHub/Discord proper nouns kept).
- **`layouts/masonry.vue`**: `LOADING`.
- **`layouts/onboarding.vue`**: alt `ChronoFrame Logo` (brand text kept).

### Components
- **`ui/UploadQueuePanel.vue`** (~12): `文件上传队列`, stat suffixes (`等待`/`进行中`/`完成`/`失败`/`跳过`/`被阻止`),
  summary row, buttons (`清除已完成`/`清除全部`/`队列管理`).
- **`ui/CalendarHeatmap`**: English-only month/day/`Less`/`More`/`on`/`contributions` constants — should consume
  `common.months` / `common.days` / `common.heatmap`.
- **`ui/ThumbImage.vue`**: `加载图片失败`. **`ui/AuthForm.vue`**: alt `App Logo`. **`Histogram.vue`**: `Rendering`,
  `直方图加载失败`.
- **`photo/Viewer.vue`**: reaction toasts (`表态失败`, `操作过于频繁，请稍后再试`, `未知错误`).
  **`photo/ProgressiveImage.vue`**: `图片加载失败`, alt default `Image`. **`photo/GalleryThumbnail.vue`**: alt
  `Photo thumbnail`. **`photo/InfoPanel.vue`**: `ISO` label (only EXIF label not using `$t`).
  **`photo/ShareModal.vue`**: `Unknown error` toast fallbacks (×3).
- **`map/PhotoPin.vue`** & **`map/ClusterPin.vue`**: Chinese alt/title fallbacks (`照片 {id}`, `聚类 {id}`, `未知`).
- **`masonry/Root.vue`**: `'回到顶部'` fallbacks on backtotop tooltip/aria-label.
- **`overlay/FilterPanel.vue`**: `搜索文件名等...`, `打乱列表`.
- **`loader/Avatar.vue`**: alt `Loading...`.
- **`Wizard/ProviderSelector.vue`** & **`setting/SettingField.vue`**: `$t(key) || rawKey` fallback pattern
  (raw key leaks if translation missing; also `$t` used in script context in SettingField).
- **`setting/SettingSection.vue`**: `submitLabel ?? '保存设置'` Chinese fallback.

### Composables
- **`useUpload.ts`** (~20): entire HTTP error map hardcoded Chinese (`网络连接失败`, `客户端错误`, `服务器错误`,
  `上传超时`, `上传已中止`, `请求格式错误`, `未授权访问`, `访问被拒绝`, `上传接口不存在`, `文件冲突`, `文件过大`,
  `不支持的文件类型`, `上传频率过高`, `服务器内部错误`, `服务器暂时不可用`, `HTTP 错误`), plus `计算中...`, `{n}秒`.
- **`useSettingsForm.ts`**: toast titles `加载设置失败` / `设置已保存` / `保存设置失败`.
- **`useWizardForm.ts`**: `Failed to load wizard schema`.
- **`usePhotoSort.ts`**: fallback label `拍摄时间（新到旧）`.
- **`useImageLoader.ts`**: `载入图片失败`.

### Intentionally left (proper nouns / brand)
`GitHub`, `Discord`, `ChronoFrame`, EXIF technical tokens.
