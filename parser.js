function Token(type, value) {
    this.type = type;
    this.value = value;
}


/* *** KEY ***
 dash == --
 arrow == -->
 element == a, b, c, 1, 2, 3, etc
 state == $X, where X is the name of an identifier. Preferably captial
 */

//const test_str = "$S -- a, b --> $1";
const test_str = "$S -- a, b --> $1\n$1 -- c --> $F";

/* Consumes an input string and returns tokens */
const lexer = function(rawInputString){
    let whitespace = /\s/;
    var tokenArr = [];
    for (let i = 0; i < rawInputString.length; i++) {
        if (whitespace.test(rawInputString[i]))
            continue;
        switch (rawInputString[i]) {
            case ',':
            case ' ':
                continue; //restart the loop skipping white space
            case '$':
                tokenArr.push(new Token('state', rawInputString.substring(i, i + 2)));
                i++; //move the lexer forward one so as to not rescan consumed input
                break;
            case '-':
                if (rawInputString[i + 2] === '>') {
                    tokenArr.push(new Token('arrow', rawInputString.substring(i, i + 3)));
                    i += 2;
                } else if (rawInputString[i + 1] === '-') {
                    tokenArr.push(new Token('dash', rawInputString.substring(i, i + 2)));
                    i++;
                } else {
                    throw `Syntax Error ${rawInputString[i + 1]}`;
                }
                break;
            default:
                tokenArr.push(new Token('element', rawInputString[i]));
                break;
        }
    }
    return tokenArr;
}

let tokens = lexer(test_str);


console.log(tokens);
function ASTElementNode(value) {
    return {
        type: 'ElementLiteral',
        value: value
    }

}
function StateTransition(name) {
    return {
        type: 'TransitionState',
        name: name,
        accepts: new Set(),
        transitionsTo: '' //another TransitionStates name
    }
}



/* Consumes an array of tokens and returns the AST.
 * Reformats into a representation that describes each part
 * of the syntax in relation to one another */
const syntacticAnalyzer = function(tokens) {
    let AST = {
        type: 'Program',
        body: []
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'state') {
            if (tokens[i + 1].type !== 'dash')
                throw "Syntax Error. Expected syntax element '--' instead recieved: " + tokens[i + 1].value;
            let stateNode = new StateTransition(tokens[i].value);
            i = i + 2; //skip the dash
            if (tokens[i].type !== 'element')
                throw "Syntax Error. Expected a token (e.g. a, b, c) instead recieved: " + tokens[i].value;
            while (tokens[i].type === 'element') {
                stateNode.accepts.add(tokens[i].value);
                i++;
            }
            if (tokens[i].type === 'arrow') {
                if (tokens[i + 1].type !== 'state')
                    throw "Syntax Error. Expected type state (e.g. $X), recieved: " + tokens[i + 1].value;
                stateNode.transitionsTo = tokens[i + 1].value;
            } else {
                throw "Syntax Error: Expected syntax element '-->' instead recieved: " + tokens[i].value;
            }
            AST.body.push(stateNode);
            i++;
        }
    }


    return AST;
}
const AST = syntacticAnalyzer(tokens);

const visitor = {
    TransitionState: {
        enter(node, parent){
        },
        exit(node, parent){
        }
    }
}
