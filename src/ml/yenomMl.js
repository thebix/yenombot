
import { Observable } from 'rxjs'
import json2csv from 'json2csv'
import lib from '../lib/root'
import history from '../history/history'
import config from '../config'
import storage from '../storage'

export default templateId =>
    Observable.combineLatest(
        storage.getItem(templateId, 'paymentGroups')
            .filter(paymentGroups => {
                return paymentGroups
            }),
        history.getAll(templateId)
            .filter(historyAll => {
                return historyAll && historyAll.length > 0
            })
            .map(historyAll =>
                historyAll.filter(historyItem => {
                    return !historyItem.date_delete && !historyItem.category !== 'uncat'
                }))
            .filter(historyAll => {
                return historyAll && historyAll.length > 0
            }),
        (paymentGroups, historyAll) => ({ paymentGroups, historyAll })
    )
        // .observeOn()
        .map(paymentGroupsAndHistoryAll => {
            const { paymentGroups, historyAll } = paymentGroupsAndHistoryAll

            const groupsBatches = 10
            const trainPerc = 80

            const trainData = []
            const testData = []

            paymentGroups.forEach(paymentGroup => {
                const historyGroupItemsArray = historyAll
                    .filter(historyItem => historyItem.category === paymentGroup.title
                    && historyItem.value > 9)

                // const historyGroupItemsObject = {}
                // for (let i = 0; i < historyGroupItemsArray.length; i += 1) {
                //     const historyGroupItem = historyGroupItemsArray[i]
                //     const { value, category } = historyGroupItem
                //     historyGroupItemsObject[`${value}${category}`] = {
                //         value: parseInt(value, 10),
                //         category
                //     }
                // }

                // const historyGroupItems = Object.keys(historyGroupItemsObject)
                //     .map(key => historyGroupItemsObject[key])
                //     .sort((i1, i2) => i1.value - i2.value)

                const historyGroupItems =
                    historyGroupItemsArray.sort((i1, i2) => i1.value - i2.value)
                // .map(historyGroupItem => Object.assign({}, historyGroupItem, {
                //     value: parseInt(historyGroupItem.value, 10)
                // }))

                const minMaxValueDiff = historyGroupItems[historyGroupItems.length - 1].value - historyGroupItems[0].value
                const batchValueStep = Math.round(minMaxValueDiff / groupsBatches)

                for (let i = 0; i < groupsBatches; i += 1) {
                    const batchHistoryGroupItems = historyGroupItems
                        .filter(historyGroupItem => {
                            return historyGroupItem.value >= batchValueStep * i
                                && historyGroupItem.value < batchValueStep * (i + 1)
                        })
                    // .sort(() => Math.random() - 0.5)

                    const trainBatchCount = Math.round(batchHistoryGroupItems.length * trainPerc / 100)
                    trainData.push(...batchHistoryGroupItems.slice(0, trainBatchCount))
                    testData.push(...batchHistoryGroupItems.slice(trainBatchCount))
                }
            })

            const paymentGroupsMappedToId = {}
            paymentGroups.forEach(paymentGroup => {
                paymentGroupsMappedToId[paymentGroup.title] = paymentGroup.id - 1
            })
            const fields = ['value', {
                label: 'category',
                value(row) {
                    return paymentGroupsMappedToId[row.category]
                }
            }]
            const fieldsNames = ['value', 'category']
            const csvTrain = json2csv({
                data: trainData,
                fields,
                fieldsNames,
                del: ','
            })
            const csvTest = json2csv({
                data: testData,
                fields,
                fieldsNames,
                del: ','
            })
            return { csvTrain, csvTest }
        })
        .switchMap(csvData => {
            const { csvTrain, csvTest } = csvData
            const fileCsvTrain = `${config.dirStorage}ml-${templateId}-train.csv`
            const fileCsvTest = `${config.dirStorage}ml-${templateId}-test.csv`
            return Observable.combineLatest(
                lib.fs.saveFile(fileCsvTrain, csvTrain),
                lib.fs.saveFile(fileCsvTest, csvTest),
                (trainSaveResult, testSaveResult) =>
                    trainSaveResult && testSaveResult
            )
        })
