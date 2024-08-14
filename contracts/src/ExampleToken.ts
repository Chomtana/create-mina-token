import { MinaToken } from "./MinaToken.js";

export class ExampleToken extends MinaToken {
  SYMBOL = "CREATE"
  INITIAL_SUPPLY = 10n ** 6n * 10n ** 18n
}