import type { MenuTreeGroup, MenuTreeNode } from "../interfaces/menu";

const flattenMenuNodes = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
  return nodes.flatMap((node) => [node, ...flattenMenuNodes(node.chilren ?? [])]);
};

export const findMenuByPath = (groups: MenuTreeGroup[], pathname: string): MenuTreeNode | null => {
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const nodes = groups.flatMap((group) => flattenMenuNodes(group.group_children));

  const matchedNodes = nodes.filter((node) => {
    if (!node.url) return false;

    const normalizedMenuPath = node.url.replace(/\/+$/, "") || "/";
    return (
      normalizedPathname === normalizedMenuPath ||
      normalizedPathname.startsWith(`${normalizedMenuPath}/`)
    );
  });

  if (matchedNodes.length === 0) {
    return null;
  }

  return matchedNodes.sort((first, second) => (second.url?.length ?? 0) - (first.url?.length ?? 0))[0];
};
