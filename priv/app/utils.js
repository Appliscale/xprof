export default class Utils {
  static chartId(MFA) {
    var formatted_mfa = MFA[3];

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

  static getLanguageGuides(mode) {
    if (!mode) {
      return {
        language: null,
        type: null,
        example: null
      };
    } else if (mode === "elixir") {
      return {
        language: "Elixir",
        type: "query",
        example: "Elixir.Enum.member?(_, :test)"
      };
    } else {
      return {
        language: "Erlang",
        type: "trace pattern",
        example: "ets:lookup(data, _)"
      };

    }
  }
}
