'use strict';

// --- SendTo signal-cmb --------------------------------------------------
Blockly.Words['signal-cmb']               = {'en': 'signal CMB',                  'de': 'signal CMB'};
Blockly.Words['signal-cmb_message']       = {'en': 'message',                     'de': 'Meldung'};
Blockly.Words['signal-cmb_phone']         = {'en': 'Recipient (optional)',        'de': 'Empfänger (optional)'};
Blockly.Words['signal-cmb_anyInstance']   = {'en': 'all instances',               'de': 'Alle Instanzen'};
Blockly.Words['signal-cmb_tooltip']       = {"en": "Send message to signal via CallMeBot API", "de": "Senden Sie eine Nachricht über die CallMeBot-API an signal"};
Blockly.Words['signal-cmb_log']           = {'en': 'log level',                   'de': 'Loglevel',                           'ru': 'Протокол'};
Blockly.Words['signal-cmb_log_none']      = {'en': 'none',                        'de': 'keins'};
Blockly.Words['signal-cmb_log_info']      = {'en': 'info',                        'de': 'info'};
Blockly.Words['signal-cmb_log_debug']     = {'en': 'debug',                       'de': 'debug'};
Blockly.Words['signal-cmb_log_warn']      = {'en': 'warning',                     'de': 'warning'};
Blockly.Words['signal-cmb_log_error']     = {'en': 'error',                       'de': 'error'};
Blockly.Words['signal-cmb_help']          = {'en': 'https://github.com/necotec/ioBroker.signal-cmb/blob/master/README.md', 'de': 'https://github.com/necotec/ioBroker.signal-cmb/blob/master/README.md'};

Blockly.Sendto.blocks['signal-cmb'] =
    '<block type="signal-cmb">'
    + '     <value name="INSTANCE">'
    + '     </value>'
    + '     <value name="MESSAGE">'
    + '         <shadow type="text">'
    + '             <field name="TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="PHONE">'
    + '     </value>'
    + '     <value name="LOG">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['signal-cmb'] = {
    init: function() {
        var options = [[Blockly.Words['signal-cmb_anyInstance'][systemLang], '']];
        if (typeof main !== 'undefined' && main.instances) {
            for (var i = 0; i < main.instances.length; i++) {
                var m = main.instances[i].match(/^system.adapter.signal-cmb.(\d+)$/);
                if (m) {
                    var k = parseInt(m[1], 10);
                    options.push(['signal-cmb.' + k, '.' + k]);
                }
            }
            if (options.length === 0) {
                for (var u = 0; u <= 4; u++) {
                    options.push(['signal-cmb.' + u, '.' + u]);
                }
            }
        } else {
            for (var n = 0; n <= 4; n++) {
                options.push(['signal-cmb.' + n, '.' + n]);
            }
        }

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Words['signal-cmb'][systemLang])
            .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

        this.appendValueInput('MESSAGE')
            .appendField(Blockly.Words['signal-cmb_message'][systemLang]);

        var input = this.appendValueInput('PHONE')
            .setCheck('String')
            .appendField(Blockly.Words['signal-cmb_phone'][systemLang]);

        this.appendDummyInput('LOG')
            .appendField(Blockly.Words['signal-cmb_log'][systemLang])
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['signal-cmb_log_none'][systemLang],  ''],
                [Blockly.Words['signal-cmb_log_info'][systemLang],  'log'],
                [Blockly.Words['signal-cmb_log_debug'][systemLang], 'debug'],
                [Blockly.Words['signal-cmb_log_warn'][systemLang],  'warn'],
                [Blockly.Words['signal-cmb_log_error'][systemLang], 'error']
            ]), 'LOG');

        if (input.connection) input.connection._optional = true;

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Words['signal-cmb_tooltip'][systemLang]);
        this.setHelpUrl(Blockly.Words['signal-cmb_help'][systemLang]);
    }
};

Blockly.JavaScript['signal-cmb'] = function(block) {
    var dropdown_instance = block.getFieldValue('INSTANCE');
    var logLevel = block.getFieldValue('LOG');
    var value_message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    var value_phone = Blockly.JavaScript.valueToCode(block, 'PHONE', Blockly.JavaScript.ORDER_ATOMIC);

    var logText;
    if (logLevel) {
        logText = 'console.' + logLevel + '("signal-cmb' + (value_phone ? '[' + value_phone + ']' : '') + ': " + ' + value_message + ');\n'
    } else {
        logText = '';
    }

    return 'sendTo("signal-cmb' + dropdown_instance + '", "send", {\n    text: ' +
        value_message + (value_phone ? ',\n    ' + 'phone: ' + value_phone : '') +
        '\n});\n' +
        logText;
};
