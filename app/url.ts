/** 将带部署前缀的请求路径映射为站点静态文件路径。 */
export function stripBaseUrl(requestPath: string, baseUrl: string): string | null {
  const base = baseUrl === "/" ? "" : `/${baseUrl.split("/").filter(Boolean).join("/")}`;
  if (base === "") return requestPath.startsWith("/") ? requestPath : `/${requestPath}`;
  if (requestPath === base || requestPath === `${base}/`) return "/";
  if (!requestPath.startsWith(`${base}/`)) return null;
  return requestPath.slice(base.length);
}
