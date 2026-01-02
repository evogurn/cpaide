/**
 * Folder Utility Functions
 * Helper functions for folder operations
 */

/**
 * Build folder tree from flat list
 * @param {Array} folders - Flat list of folders
 * @returns {Array} Hierarchical folder tree
 */
export const buildFolderTree = (folders) => {
  // Create a map of folders by ID for quick lookup
  const folderMap = {};
  folders.forEach(folder => {
    folderMap[folder.id] = { ...folder, children: [] };
  });

  // Build the tree structure
  const tree = [];
  folders.forEach(folder => {
    if (folder.parentId) {
      // If folder has a parent, add it to parent's children
      if (folderMap[folder.parentId]) {
        folderMap[folder.parentId].children.push(folderMap[folder.id]);
      }
    } else {
      // If folder has no parent, it's a root folder
      tree.push(folderMap[folder.id]);
    }
  });

  return tree;
};

/**
 * Flatten folder tree to flat list
 * @param {Array} folderTree - Hierarchical folder tree
 * @returns {Array} Flat list of folders
 */
export const flattenFolderTree = (folderTree) => {
  const result = [];
  
  const traverse = (folders) => {
    folders.forEach(folder => {
      result.push(folder);
      if (folder.children && folder.children.length > 0) {
        traverse(folder.children);
      }
    });
  };
  
  traverse(folderTree);
  return result;
};

export default {
  buildFolderTree,
  flattenFolderTree
};