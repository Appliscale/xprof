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

    let OutMFA = [ MFA[0], MFA[1], MFA[2] ];

    if (!Utils.can_be_unescaped_atom(OutMFA[0])) {
      OutMFA[0] = `'${OutMFA[0]}'`;
    }

    if (!Utils.can_be_unescaped_atom(OutMFA[1])) {
      OutMFA[1] = `'${OutMFA[1]}'`;
    }

    return `${OutMFA[0]}:${OutMFA[1]}/${OutMFA[2]}`;
  }


  static chartId(MFA) {
    var formatted_mfa = this.formatMFA(MFA);

    // Characters that have special meaning in CSS selectors are not safe in an ID.
    // (eg ':', '.', '?', '*' or single quote itself)
    // (A very problematic example: "'Elixir.List':'keymember?'/*")
    return "chart_" + formatted_mfa.replace(/[^A-Za-z0-9_-]/g, "-");
  }

  static commonArrayPrefix(sortedArray) {
    var string1 = sortedArray[0];
    var string2 = sortedArray[sortedArray.length - 1];
    return this.commonPrefix(string1, string2);
  }

  static commonPrefix(string1, string2) {
    var len = string1.length;
    var i = 0;

    while (i < len && string1.charAt(i) === string2.charAt(i)) {
      i++;
    }
    return string1.substring(0, i);
  }
}
