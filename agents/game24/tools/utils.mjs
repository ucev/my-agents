
const toNumber = (number) => {
    return Number(Number.parseFloat(number).toFixed(2));
}

export const getPoints24 = (numbers, steps = [], visited = new Set()) => {
    if (!numbers.length) {
        return false;
    }
    if (numbers.length === 1) {
        if (numbers[0] !== 24) {
            return false;
        }
        let formula = ['24'];
        for (let i = steps.length - 1; i >= 0; i--) {
            const [k, v] = steps[i];
            for (let j = 0; j < formula.length; j++) {
                if (toNumber(formula[j]) === toNumber(k)) {
                    formula[j] = `( ${v} )`;
                    formula = formula.join(' ').split(' ');
                    break;
                }
            }
        }
        return formula.join(' ');
    }
    const key = numbers.sort((a, b) => a - b).join(',');
    if (visited.has(key)) {
        return false;
    }
    visited.add(key);
    for (let i = 0; i < numbers.length - 1; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            let vi = numbers[i];
            let vj = numbers[j];
            let nums = [...numbers];
            nums.splice(j, 1);
            nums.splice(i, 1);
            let res = getPoints24(
                [...nums, vi + vj],
                [
                    ...steps,
                    [vi + vj, `${vi} + ${vj}`],
                ],
                visited,
            ) ||
                getPoints24(
                    [...nums, vi - vj],
                    [
                        ...steps,
                        [vi - vj, `${vi} - ${vj}`],
                    ],
                    visited,
                ) ||
                getPoints24(
                    [...nums, vj - vi],
                    [
                        ...steps,
                        [vj - vi, `${vj} - ${vi}`],
                    ],
                    visited,
                ) ||
                getPoints24(
                    [...nums, vi * vj],
                    [
                        ...steps,
                        [vi * vj, `${vi} * ${vj}`],
                    ],
                    visited,
                ) ||
                getPoints24(
                    [...nums, vi / vj],
                    [
                        ...steps,
                        [vi / vj, `${vi} / ${vj}`],
                    ],
                    visited,
                ) ||
                getPoints24(
                    [...nums, vj / vi],
                    [
                        ...steps,
                        [vj / vi, `${vj} / ${vi}`],
                    ],
                    visited,
                );
            if (res) {
                return res;
            }
        }
    }
    return false;
}