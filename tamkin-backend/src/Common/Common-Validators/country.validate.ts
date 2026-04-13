import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import countries from "i18n-iso-countries";

@ValidatorConstraint({ name: "isCountryCode", async: false })
export class IsCountryCode implements ValidatorConstraintInterface {

    validate(value: string) {
        if (!value || typeof value !== 'string') return false;
        return countries.isValid(value);
    }

    defaultMessage() {
        return "Invalid country code";
    }

}
