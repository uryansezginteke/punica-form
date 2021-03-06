import { Reader } from './reader';
import { IReader } from '@punica/form-model';
import {
  ChapterReader,
  ConverterReader,
  DataReader,
  ItemsReader,
  ControlReader,
  DisabledReader,
  HiddenReader,
  ItemLayout
} from './decorators/readers';

const createReader = (): IReader<any, any> => {
  const reader = new Reader();

  const itemsReader = new ItemsReader(reader);
  const chapterReader = new ChapterReader(itemsReader);
  const dataReader = new DataReader(chapterReader);
  const converterReader = new ConverterReader(dataReader);
  const disabledReader = new DisabledReader(converterReader);
  const hiddenReader = new HiddenReader(disabledReader);
  const controlReader = new ControlReader(hiddenReader);
  const itemLayoutReader = new ItemLayout(controlReader);

  return itemLayoutReader;
};

export default createReader;
