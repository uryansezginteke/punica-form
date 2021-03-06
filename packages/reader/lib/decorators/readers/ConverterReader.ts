import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form-model';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>) {
    await items.forEach((item: F) => {
      const { converter } = item;

      if (converter) {
        const { value } = item;
        const { input: inputConverter } = converter;

        item.value = inputConverter(value);
      }
    });
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<IForm<F>> {
    const form: IForm<F> = await super.read(entity);

    this.readItemsData(form.items);

    return form;
  }
}

export default Reader;
