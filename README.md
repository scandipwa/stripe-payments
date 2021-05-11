# Stripe extension for ScandiPWA
Heads up! This extension installation will only make you halfway to success. Supplementing it with a [Stripe extension back-end](https://github.com/scandipwa/stripe-graphql) is a **must**

Learn more about installing Scandipwa extensions in our [official docs 🚀](https://docs.create-scandipwa-app.com/extensions/extensions)

> **Note 1**: In order to get this payment method, you need to install additional extensions.

Stripe is implemented via stripe `react-stripe-elements` component. In the checkout it looks like this for simple card payments:

![image](https://user-images.githubusercontent.com/29531824/69980856-c1628580-1539-11ea-9a9d-cf24a53c766e.png)

**To install**:

> **Note 2**: it is recommended to install from Magento Marketplace - bellow is the manual instruction

1. Go to https://stripe.com/docs/plugins/magento/install 
2. Download the archive containing the FE part of the extension from the marketplace or GitHub
3. Create a `packages` directory inside of your theme's root (`cd packages/scandipwa && mkdir packages`)
3. Put the archive's contents inside of the `packages/<package name>` directory. Make sure that you have a `packages/<package name>/package.json` file present alongside all the other extension's contents, that means that you have unpacked the extension correctly. Note: `<package name>` can also include publisher, `@scandipwa/stripe-payments` is a valid package name.
4. Add the following scripts to the scripts section of your theme's `package.json` file. This is necessary for your package to be symlinked into the `node_modules` directory of your theme after manipulations with dependencies
```json
{
    "scripts": {
        "postinstall": "scandipwa-scripts link",
        "postupdate": "scandipwa-scripts link"
    }
}
```
5. Add the extension to the dependencies of your theme, as follows:
```json
{
    "dependencies": {
        "@scandipwa/stripe-payments": "file:packages/stripe-payments"
    }
}
```
6. Enable the extension:
```json
{
  "scandipwa": {
    "extensions": {
      "stripe-payments": true
    }
  }
}
```
7. Run the `npm i` or `yarn` command in the theme root directory amongst with the `postinstall` command that you have added in *Step 5*. Facing the installation difficulties? Please ensure you have read all our FAQs

**To configure**:
1. Go to https://dashboard.stripe.com/ - signup
2. Go to *Developer > Api Keys*, copy credentials
3. Go to *Store > Configuration > Sales > Payment Methods > Stripe* and enter credentials from above

**Technical details**:

Extends the Magento store config to include the publishable Stripe API keys and the current mode. These can be configured in the Magento Admin panel, in Stores > Settings: Configuration > Sales: Payment Methods > Stripe > Basic Settings

Example query:

```graphql
query {
  storeConfig {
    stripe_mode
    stripe_live_pk
    stripe_test_pk
  } 
}
```
