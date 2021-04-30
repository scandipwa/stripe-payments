/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import CheckoutQuery from 'Query/Checkout.query';
import { isSignedIn } from 'Util/Auth';
import { fetchMutation } from 'Util/Request';

export const STRIPE_AUTH_REQUIRED = 'Authentication Required: ';
export const STRIPE_CODE = 'stripe_payments';

class CheckoutContainerPlugin {
    _handleError(error, paymentInformation, handleAuthorization, instance) {
        const [{ message = '' }] = error;

        if (handleAuthorization && message.includes(STRIPE_AUTH_REQUIRED)) {
            const secret = this.getSecret(message);
            instance.setState({ isLoading: false });

            handleAuthorization(
                paymentInformation,
                secret,
                (paymentInformation) => instance.savePaymentInformation(paymentInformation)
            );
        } else {
            instance._handleError(error);
        }
    }

    savePaymentInformation = async (args, callback, instance) => {
        const [{ stripeError = false }] = args;

        if (stripeError) {
            instance.setState({ isLoading: false });
            return true;
        }

        callback.apply(instance, args);
        return true;
    };

    savePaymentMethodAndPlaceOrder = async (args, callback, instance) => {
        const [paymentInformation] = args;
        const { paymentMethod: { code, additional_data, handleAuthorization } } = paymentInformation;
        const guest_cart_id = !isSignedIn() ? instance._getGuestCartId() : '';

        if (code !== STRIPE_CODE) {
            callback.apply(instance, args);
        }

        try {
            await fetchMutation(CheckoutQuery.getSetPaymentMethodOnCartMutation({
                guest_cart_id,
                payment_method: {
                    code,
                    [code]: additional_data
                }
            }));

            const orderData = await fetchMutation(CheckoutQuery.getPlaceOrderMutation(guest_cart_id));
            const { placeOrder: { order: { order_id } } } = orderData;

            instance.setDetailsStep(order_id);
        } catch (e) {
            this._handleError(e, paymentInformation, handleAuthorization, instance);
        }
    };

    getSecret(ics = '') {
        const splitArray = ics.split(' ');

        return `${ splitArray[splitArray.length - 1] }`;
    }
}

const {
    savePaymentMethodAndPlaceOrder,
    savePaymentInformation
} = new CheckoutContainerPlugin();

export const config = {
    'Route/Checkout/Container': {
        'member-function': {
            savePaymentMethodAndPlaceOrder,
            savePaymentInformation
        }
    }
};

export default config;
