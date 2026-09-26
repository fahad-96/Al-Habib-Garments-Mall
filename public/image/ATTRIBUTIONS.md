# Photo attributions

The built-in demo catalog uses open-source product photography so the store looks complete before
the owner uploads their own photos from the admin dashboard.

| Source | License | Used for |
| --- | --- | --- |
| [magento/magento2-sample-data](https://github.com/magento/magento2-sample-data) (Luma sample catalog, `pub/media/catalog/product`) | Open Software License 3.0 | Men's and women's jackets, hoodies, tees, track pants, shorts, vests; bags |
| [Sylius/Sylius](https://github.com/Sylius/Sylius) (`src/Sylius/Bundle/CoreBundle/Resources/fixtures/caps`) | MIT | Beanies |

Each photo was resized to 900 × 1200 WebP, with a 450 × 600 copy (`-sm.webp`) for phones, by
`scripts/demo-catalog/build.mjs`. Product names, descriptions and colour names are our own. Replace
the photos with your own from Admin → Products; none of them are needed once the store has its own products.
