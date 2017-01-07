export default class Utils {
  static can_be_unescaped_atom(atom) {
    if (atom[0].search(/[a-z]/) === -1) {
      return false;
    }

    if (atom.search(/[^a-zA-Z@0-9_]/) !== -1) {
      return false;
    }

    return true;
  }

  static formatMFA(MFA) {
    if (MFA.length !== 3) {
      throw new Error(`Unexpected argument passed to the formatter (MFA length: ${MFA.length}).`);
    }

    if (typeof (MFA[0]) !== "string") {
      throw new Error("Module name is not a string.");
    }

    if (MFA[0].length === 0) {
      throw new Error("Module name is an empty string.");
    }

    if (typeof (MFA[1]) !== "string") {
      throw new Error("Function name is not a string.");
    }

    if (MFA[1].length === 0) {
      throw new Error("Function name is an empty string.");
    }

    if (!Utils.can_be_unescaped_atom(MFA[0])) {
      MFA[0] = `'${MFA[0]}'`;
    }

    if (!Utils.can_be_unescaped_atom(MFA[1])) {
      MFA[1] = `'${MFA[1]}'`;
    }

    return `${MFA[0]}:${MFA[1]}/${MFA[2]}`;
  }
}
