// キャッシュファイルの指定
const CACHE_NAME = "pwa-sample-caches";
const ORIGIN = self.location.origin;
const CACHE_URL = [
  `${ORIGIN}/pwa/`,
  `${ORIGIN}/pwa/translate/`,
  `${ORIGIN}/pwa/vocabulary/`,
  `${ORIGIN}/favicon.ico`,
];

// インストール処理
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_URL);
    })
  );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", function (event) {
  // キャッシュがあればキャッシュを返す
  caches.match(event.request).then(function (response) {
    return response ? response : fetch(event.request);
  });
});
