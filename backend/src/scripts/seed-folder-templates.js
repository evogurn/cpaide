import prisma from '../config/db.js';

// Define default folder templates for different industries
const defaultTemplates = [
  {
    name: 'Builders Template',
    industry: 'Builders',
    description: 'Standard folder structure for construction and building businesses',
    isSystem: true,
    nodes: [
      { name: 'Projects', level: 0, position: 0 },
      { name: 'Project {ProjectName}', level: 1, position: 0, parentId: null, isPlaceholder: true }, // Will be updated after first node is created
      { name: 'Contracts', level: 2, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Permits', level: 2, position: 1, parentId: null, isPlaceholder: true },
      { name: 'Drawings', level: 2, position: 2, parentId: null, isPlaceholder: true },
      { name: 'Invoices', level: 2, position: 3, parentId: null, isPlaceholder: true },
      { name: 'Photos', level: 2, position: 4, parentId: null, isPlaceholder: true },
      { name: 'Client Correspondence', level: 2, position: 5, parentId: null, isPlaceholder: true },
    ]
  },
  {
    name: 'Accountants Template',
    industry: 'Accountants',
    description: 'Standard folder structure for accounting firms',
    isSystem: true,
    nodes: [
      { name: 'Clients', level: 0, position: 0 },
      { name: 'Client {ClientName}', level: 1, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Tax Returns', level: 2, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Financial Statements', level: 2, position: 1, parentId: null, isPlaceholder: true },
      { name: 'Receipts', level: 2, position: 2, parentId: null, isPlaceholder: true },
      { name: 'Bank Statements', level: 2, position: 3, parentId: null, isPlaceholder: true },
      { name: 'Payroll', level: 2, position: 4, parentId: null, isPlaceholder: true },
      { name: 'Invoices', level: 2, position: 5, parentId: null, isPlaceholder: true },
    ]
  },
  {
    name: 'Electricians Template',
    industry: 'Electricians',
    description: 'Standard folder structure for electrical service businesses',
    isSystem: true,
    nodes: [
      { name: 'Jobs', level: 0, position: 0 },
      { name: 'Job {JobName}', level: 1, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Estimates', level: 2, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Permits', level: 2, position: 1, parentId: null, isPlaceholder: true },
      { name: 'Wiring Diagrams', level: 2, position: 2, parentId: null, isPlaceholder: true },
      { name: 'Inspection Reports', level: 2, position: 3, parentId: null, isPlaceholder: true },
      { name: 'Invoices', level: 2, position: 4, parentId: null, isPlaceholder: true },
      { name: 'Equipment Logs', level: 2, position: 5, parentId: null, isPlaceholder: true },
    ]
  },
  {
    name: 'Plumbers Template',
    industry: 'Plumbers',
    description: 'Standard folder structure for plumbing service businesses',
    isSystem: true,
    nodes: [
      { name: 'Service Calls', level: 0, position: 0 },
      { name: 'Job {JobName}', level: 1, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Estimates', level: 2, position: 0, parentId: null, isPlaceholder: true },
      { name: 'Permits', level: 2, position: 1, parentId: null, isPlaceholder: true },
      { name: 'Piping Diagrams', level: 2, position: 2, parentId: null, isPlaceholder: true },
      { name: 'Inspection Reports', level: 2, position: 3, parentId: null, isPlaceholder: true },
      { name: 'Invoices', level: 2, position: 4, parentId: null, isPlaceholder: true },
      { name: 'Equipment Logs', level: 2, position: 5, parentId: null, isPlaceholder: true },
    ]
  }
];

async function seedFolderTemplates() {
  console.log('Seeding folder templates...');

  try {
    // Clear existing system templates
    await prisma.folderTemplateNode.deleteMany({
      where: {
        template: {
          isSystem: true
        }
      }
    });

    await prisma.folderTemplate.deleteMany({
      where: {
        isSystem: true
      }
    });

    // Create new templates
    for (const templateData of defaultTemplates) {
      // Process nodes to handle parent-child relationships
      const nodesWithIds = [];
      const nodeIdMap = new Map(); // Maps original index to actual DB ID

      // First, create the template without nodes
      const template = await prisma.folderTemplate.create({
        data: {
          name: templateData.name,
          industry: templateData.industry,
          description: templateData.description,
          isSystem: templateData.isSystem,
          isActive: true,
        }
      });

      // Create nodes in level order to ensure parent IDs exist
      const levels = [...new Set(templateData.nodes.map(node => node.level))].sort((a, b) => a - b);
      
      for (const level of levels) {
        const nodesAtLevel = templateData.nodes
          .filter(node => node.level === level)
          .map((node, originalIndex) => ({ ...node, originalIndex }));

        for (const node of nodesAtLevel) {
          let actualParentId = null;
          
          // If this node has a parent, find the actual DB ID of the parent
          if (node.parentId !== null) {
            // In our case, since we're using null for all parentIds initially,
            // we need to figure out the parent based on the hierarchy
            // For example, a level 1 node's parent is the level 0 node
            const parentNode = templateData.nodes.find(n => 
              n.level === node.level - 1 && n.position === 0
            );
            
            if (parentNode) {
              const parentOriginalIndex = templateData.nodes.indexOf(parentNode);
              actualParentId = nodeIdMap.get(parentOriginalIndex);
            }
          } else if (node.level > 0) {
            // Find the appropriate parent based on level
            const parentNode = templateData.nodes.find(n => 
              n.level === node.level - 1
            );
            
            if (parentNode) {
              const parentOriginalIndex = templateData.nodes.indexOf(parentNode);
              actualParentId = nodeIdMap.get(parentOriginalIndex);
            }
          }

          const createdNode = await prisma.folderTemplateNode.create({
            data: {
              templateId: template.id,
              name: node.name,
              parentId: actualParentId,
              level: node.level,
              position: node.position,
              isPlaceholder: node.isPlaceholder || false,
            }
          });

          nodeIdMap.set(node.originalIndex, createdNode.id);
          nodesWithIds.push(createdNode);
        }
      }

      console.log(`Created template: ${template.name} with ${nodesWithIds.length} nodes`);
    }

    console.log('Folder templates seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding folder templates:', error);
    throw error;
  }
}

// Also create a function to properly handle the template creation with correct parent-child relationships
async function seedFolderTemplatesCorrectly() {
  console.log('Seeding folder templates with proper hierarchy...');

  try {
    // Clear existing system templates
    await prisma.folderTemplateNode.deleteMany({
      where: {
        template: {
          isSystem: true
        }
      }
    });

    await prisma.folderTemplate.deleteMany({
      where: {
        isSystem: true
      }
    });

    // Define templates with proper hierarchy
    const templatesWithHierarchy = [
      {
        name: 'Builders Template',
        industry: 'Builders',
        description: 'Standard folder structure for construction and building businesses',
        isSystem: true,
        nodes: [
          { name: 'Projects', level: 0, position: 0, isPlaceholder: false },
          { name: 'Project {ProjectName}', level: 1, position: 0, parentId: null, isPlaceholder: true }, // Will be set after creation
          { name: 'Contracts', level: 2, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Permits', level: 2, position: 1, parentId: null, isPlaceholder: true },
          { name: 'Drawings', level: 2, position: 2, parentId: null, isPlaceholder: true },
          { name: 'Invoices', level: 2, position: 3, parentId: null, isPlaceholder: true },
          { name: 'Photos', level: 2, position: 4, parentId: null, isPlaceholder: true },
          { name: 'Client Correspondence', level: 2, position: 5, parentId: null, isPlaceholder: true },
        ]
      },
      {
        name: 'Accountants Template',
        industry: 'Accountants',
        description: 'Standard folder structure for accounting firms',
        isSystem: true,
        nodes: [
          { name: 'Clients', level: 0, position: 0, isPlaceholder: false },
          { name: 'Client {ClientName}', level: 1, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Tax Returns', level: 2, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Financial Statements', level: 2, position: 1, parentId: null, isPlaceholder: true },
          { name: 'Receipts', level: 2, position: 2, parentId: null, isPlaceholder: true },
          { name: 'Bank Statements', level: 2, position: 3, parentId: null, isPlaceholder: true },
          { name: 'Payroll', level: 2, position: 4, parentId: null, isPlaceholder: true },
          { name: 'Invoices', level: 2, position: 5, parentId: null, isPlaceholder: true },
        ]
      },
      {
        name: 'Electricians Template',
        industry: 'Electricians',
        description: 'Standard folder structure for electrical service businesses',
        isSystem: true,
        nodes: [
          { name: 'Jobs', level: 0, position: 0, isPlaceholder: false },
          { name: 'Job {JobName}', level: 1, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Estimates', level: 2, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Permits', level: 2, position: 1, parentId: null, isPlaceholder: true },
          { name: 'Wiring Diagrams', level: 2, position: 2, parentId: null, isPlaceholder: true },
          { name: 'Inspection Reports', level: 2, position: 3, parentId: null, isPlaceholder: true },
          { name: 'Invoices', level: 2, position: 4, parentId: null, isPlaceholder: true },
          { name: 'Equipment Logs', level: 2, position: 5, parentId: null, isPlaceholder: true },
        ]
      },
      {
        name: 'Plumbers Template',
        industry: 'Plumbers',
        description: 'Standard folder structure for plumbing service businesses',
        isSystem: true,
        nodes: [
          { name: 'Service Calls', level: 0, position: 0, isPlaceholder: false },
          { name: 'Job {JobName}', level: 1, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Estimates', level: 2, position: 0, parentId: null, isPlaceholder: true },
          { name: 'Permits', level: 2, position: 1, parentId: null, isPlaceholder: true },
          { name: 'Piping Diagrams', level: 2, position: 2, parentId: null, isPlaceholder: true },
          { name: 'Inspection Reports', level: 2, position: 3, parentId: null, isPlaceholder: true },
          { name: 'Invoices', level: 2, position: 4, parentId: null, isPlaceholder: true },
          { name: 'Equipment Logs', level: 2, position: 5, parentId: null, isPlaceholder: true },
        ]
      }
    ];

    for (const templateData of templatesWithHierarchy) {
      // Create the template
      const template = await prisma.folderTemplate.create({
        data: {
          name: templateData.name,
          industry: templateData.industry,
          description: templateData.description,
          isSystem: templateData.isSystem,
          isActive: true,
        }
      });

      // Create nodes in the right order to handle parent-child relationships
      const createdNodes = [];
      const nodeMap = new Map(); // Maps position in the array to actual DB ID

      for (let i = 0; i < templateData.nodes.length; i++) {
        const node = templateData.nodes[i];
        let actualParentId = null;

        // Find parent node if it exists
        if (node.level > 0) {
          // Find the parent node in the already created nodes
          const parentNode = createdNodes.find(n => 
            n.level === node.level - 1 && 
            n.position === (node.level === 1 ? 0 : n.position) // Simplified parent finding logic
          );
          
          if (parentNode) {
            actualParentId = parentNode.id;
          } else {
            // More sophisticated parent finding - find the last node with level = current level - 1
            const potentialParents = createdNodes.filter(n => n.level === node.level - 1);
            if (potentialParents.length > 0) {
              actualParentId = potentialParents[potentialParents.length - 1].id;
            }
          }
        }

        const createdNode = await prisma.folderTemplateNode.create({
          data: {
            templateId: template.id,
            name: node.name,
            parentId: actualParentId,
            level: node.level,
            position: node.position,
            isPlaceholder: node.isPlaceholder || false,
          }
        });

        createdNodes.push({ ...node, id: createdNode.id });
        nodeMap.set(i, createdNode.id);
      }

      console.log(`Created template: ${template.name} with ${createdNodes.length} nodes`);
    }

    console.log('Folder templates seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding folder templates:', error);
    throw error;
  }
}

// If this script is run directly
if (process.argv[2] === '--seed') {
  seedFolderTemplatesCorrectly()
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedFolderTemplatesCorrectly };