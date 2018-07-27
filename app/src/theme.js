define("ace/theme/socketfox",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

    exports.isDark = true;
    exports.cssClass = "ace-socketfox";
    exports.cssText = ".ace-socketfox .ace_gutter {\
background: #272727;\
color: #ECFFFD\
}\
.ace-socketfox .ace_print-margin {\
width: 1px;\
background: #272727\
}\
.ace-socketfox {\
background-color: #343F3E;\
color: #ECFFFD\
}\
.ace-socketfox .ace_constant.ace_other,\
.ace-socketfox .ace_cursor {\
color: #ECFFFD\
}\
.ace-socketfox .ace_marker-layer .ace_selection {\
background: #B75800\
}\
.ace-socketfox.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #2D2D2D;\
}\
.ace-socketfox .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-socketfox .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #6A6A6A\
}\
.ace-socketfox .ace_stack {\
background: rgb(66, 90, 44)\
}\
.ace-socketfox .ace_marker-layer .ace_active-line {\
background: #4a5958\
}\
.ace-socketfox .ace_gutter-active-line {\
background-color: #4a5958\
}\
.ace-socketfox .ace_marker-layer .ace_selected-word {\
border: 1px solid #515151\
}\
.ace-socketfox .ace_invisible {\
color: #6A6A6A\
}\
.ace-socketfox .ace_keyword,\
.ace-socketfox .ace_meta,\
.ace-socketfox .ace_storage,\
.ace-socketfox .ace_storage.ace_type,\
.ace-socketfox .ace_support.ace_type {\
color: #CC99CC\
}\
.ace-socketfox .ace_keyword.ace_operator {\
color: #66CCCC\
}\
.ace-socketfox .ace_constant.ace_character,\
.ace-socketfox .ace_constant.ace_language,\
.ace-socketfox .ace_constant.ace_numeric,\
.ace-socketfox .ace_keyword.ace_other.ace_unit,\
.ace-socketfox .ace_support.ace_constant,\
.ace-socketfox .ace_variable.ace_parameter {\
color: #FFFC31\
}\
.ace-socketfox .ace_invalid {\
color: #CDCDCD;\
background-color: #F2777A\
}\
.ace-socketfox .ace_invalid.ace_deprecated {\
color: #CDCDCD;\
background-color: #CC99CC\
}\
.ace-socketfox .ace_fold {\
background-color: #6699CC;\
border-color: #CCCCCC\
}\
.ace-socketfox .ace_entity.ace_name.ace_function,\
.ace-socketfox .ace_support.ace_function,\
.ace-socketfox .ace_variable {\
color: #6699CC\
}\
.ace-socketfox .ace_support.ace_class,\
.ace-socketfox .ace_support.ace_type {\
color: #FFCC66\
}\
.ace-socketfox .ace_heading,\
.ace-socketfox .ace_markup.ace_heading,\
.ace-socketfox .ace_string {\
color: #3EC300\
}\
.ace-socketfox .ace_comment {\
color: #999999\
}\
.ace-socketfox .ace_entity.ace_name.ace_tag,\
.ace-socketfox .ace_entity.ace_other.ace_attribute-name,\
.ace-socketfox .ace_meta.ace_tag,\
.ace-socketfox .ace_variable {\
color: #48AEE0\
}\
.ace-socketfox .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ09NrYAgMjP4PAAtGAwchHMyAAAAAAElFTkSuQmCC) right repeat-y\
}";

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
(function() {
    window.require(["ace/theme/socketfox"], function(m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();
