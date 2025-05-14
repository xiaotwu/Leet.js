/**
 * [20] [Easy] Valid Parentheses
 * https://leetcode.com/problems/valid-parentheses/
 */
// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    stack = [];
    for (let i = 0; i < s.length; i++) {
        let char  = s[i];
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0) return false;
            let last = stack.pop();
            if (char === ')' && last !== '(') return false;
            if (char === '}' && last !== '{') return false;
            if (char === ']' && last !== '[') return false;
            if (char === ')' && last === '(') continue;
            if (char === '}' && last === '{') continue;
            if (char === ']' && last === '[') continue;
        }
    }
    return stack.length === 0;
};
// @lc code=end

