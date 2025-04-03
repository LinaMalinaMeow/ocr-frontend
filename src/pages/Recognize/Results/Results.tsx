import { observer } from "mobx-react-lite"
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RecognizeContext, RecognizeStore } from "../../../Stores/Recognize";
import { LoadingStatus } from "../../../Stores/fetchResource";
import { Flex, Spin, Text } from "@gravity-ui/uikit";
import styles from './Results.module.css';
import classNames from "classnames";

interface ITable {
    number: string;
    recognized: string;
}

export const Results = observer(() => {
    const { 
        result: responseResult, 
        loadingStatus 
    } = useContext(RecognizeContext) as RecognizeStore;

    const [tableScores, setTableScores] = useState<ITable[] | null>(null)

    const changeCellHandler = useCallback((
        e: React.FormEvent<HTMLTableDataCellElement>,
        index: number
    ) => {
        const re = /^\d*(\.\d+)?$/
        const text = e.currentTarget.textContent;

        const onlyNumbers = text?.match(re)?.[0] || '';

        const newValue = (tableScores || []).map((cell, i) => {
            if (index !== i) return cell;

            return {...cell, recognized: onlyNumbers}
        })

        setTableScores(newValue);
    }, [tableScores])

    const results = useMemo(() => {
        if (!responseResult) return null;

        const scores = responseResult.scores;

        return Object.entries(scores).map(entry => {
            const [number, arr] = entry;
            const [recognized, _] = arr;

            return {
                number,
                recognized
            }
        })
    }, [responseResult])

    const scoreValue = useMemo(
        () => tableScores?.reduce((sum, val) => {
            const value = Number(val.recognized);
            const numberValue = Number.isNaN(value) ? 0 : value;

            const newSum = sum+numberValue;
            return newSum;
        }, 0), 
        [tableScores]
    )

    useEffect(() => {
        setTableScores(results)
    }, [results, responseResult])

    if (loadingStatus === LoadingStatus.pending) {
        return <Spin size="m" />
    }

    if (loadingStatus === LoadingStatus.error) {
        return <Text className={styles.errorText}>Извините. Не удалось распознать изображение :(</Text>
    }

    return (
        <Flex direction='column' gap='4'>
            {Boolean(responseResult?.errors) && 
                <div className={styles.errors}>
                    <Text>Ошибки: {responseResult?.errors.join(', ')}</Text>
                </div>
            }

            {Boolean(responseResult?.warnings) && 
                <div className={styles.warnings}>
                    <Text>Ошибки: {responseResult?.warnings.join(', ')}</Text>
                </div>
            }
            
            {responseResult?.participant_code && 
                <Text className={styles.fz24}>Код: 
                {' '}
                {responseResult?.participant_code}</Text> 
            }
           {Boolean(tableScores?.length) && 
            <>
                <div className={styles.table}>
                    <Text className={classNames(styles.fz18, styles.tableUpperText)}>
                        Таблица для внесения баллов участника
                    </Text>
                    <table>
                        <tr>
                            <td>Номер задания</td>
                            {tableScores?.map(({number}, i) => 
                                <td key={i}>{number}</td>)}
                        </tr>
                        <tr>
                            <td>Баллы</td>
                            {tableScores?.map(({recognized}, i) => 
                                <td 
                                    key={i} 
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={e => changeCellHandler(e, i)}>
                                        {recognized}
                                </td>)}
                        </tr>
                    </table> 
                </div>
               
                <Text className={styles.total}>Сумма баллов: 
                {' '}
                <span className={styles.brendColor}>{scoreValue}</span></Text>
            </>
           }
        </Flex>
    )
});