export interface TreeNode {
  /**
   * Size of the node
   */
  size: number;
  /**
   * Is the node a directory?
   */
  isDir: boolean;
  /**
   * Is the node a link?
   */
  isLink: boolean;
  /**
   * Children of the node, keyed by name
   */
  children: Record<string, TreeNode>;
  /**
   * Is the tree a 'shallow' tree, eg not all nodes have children
   */
  shallow: boolean;
}
