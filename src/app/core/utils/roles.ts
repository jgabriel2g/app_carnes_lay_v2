export const rolesPermissions : { [key: number]: { name: string; permissions: string[] } } = {
  1: {
       name: 'OWNER',
       permissions: [
        'view-users',
        'edit-users',
        'delete-users',
        'create-users',
        'view-module-inventory',
        'create-product',
        'view-product',
        'edit-product',
        'delete-product',
        'create-merchandise-entry',
        'approve-merchandise-entry',
        'reject-merchandise-entry',
        'view-merchandise-entry',
        'view-inventory',
        'manage-stock',
        'update-merchandise-entry',
        'view-detail-merchandise-entry',
        'view-sales-module',
        'view-sales-stock',
        'view-sales-tracking',
        'open-sales-box',
        'close-sales-box',
        'create-sales',
        'print-bill',
        'manage-providers',
        'manage-clients'

      ]
     },
  2: {
       name: 'ADMIN',
       permissions: [
        'view-users',
        'edit-users',
        'delete-users',
        'create-users',
        'view-module-inventory',
        'view-product',
        'create-product',
        'edit-product',
        'delete-product',
        'view-merchandise-entry',
        'create-merchandise-entry',
        'approve-merchandise-entry',
        'reject-merchandise-entry',
        'manage-stock',
        'update-merchandise-entry',
        'view-detail-merchandise-entry',
        'view-sales-module',
        'view-sales-stock',
        'view-sales-tracking',
        'open-sales-box',
        'close-sales-box',
        'create-sales',
        'view-tracking-sales',
        'print-bill',
        'manage-providers',
        'manage-clients'
       ]
     },
  3: {
        name: 'CAJERO',
        permissions: [
          'view-sales-module',
          'open-sales-box',
          'create-sales',
          'print-bill'
        ]
     },
  4: {
      name: 'BODEGUERO',
      permissions: [
        'view-inventory',
        'manage-stock',
        'view-module-inventory',
        'update-merchandise-entry',
        'view-merchandise-entry',
        'view-detail-merchandise-entry'

      ]
     }
};
