import { IEntity } from '@punica/common';
import { WriteToPropertyPath } from '@punica/util';
import { BaseListener } from '@punica/common';
import {
  IForm,
  IFormItem,
  IReader,
  ReadItems,
  WriteItems,
  FormEvents
} from '..';

export abstract class BaseFormController<
  E extends IEntity,
  F extends IFormItem
> extends BaseListener {
  protected _formData: IForm<F>;
  protected _entity: E;
  protected _hasError: boolean;

  /**
   *
   * @param entity
   * @param strategy
   */
  constructor(entity: E) {
    super();

    this._entity = entity;

    this.updateValue = this.updateValue.bind(this);
    this.getInitialEntity = this.getInitialEntity.bind(this);
    this.updatePropertyValue = this.updatePropertyValue.bind(this);
  }

  /**
   *
   * @param properties
   * @returns
   */
  protected readItems: ReadItems = <F>(
    properties: Array<string>
  ): Map<string, F> => {
    const map = new Map();
    const { items, itemsMap } = this._formData;

    properties.forEach((property: string) => {
      const index = itemsMap[property];
      const item = items[index];

      map.set(property, { ...item });
    });

    return map;
  };

  /**
   *
   * @param writes
   */
  protected writeItems: WriteItems = (writes: Array<IFormItem>): void => {
    writes?.forEach((item: IFormItem) => {
      const { itemsMap, items } = this._formData;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    });
  };

  /**
   *
   * @param eventType
   * @param data
   */
  protected fireEvent(eventType: FormEvents, data: any): void {
    this.trigger(eventType, data);
  }

  /**
   *
   * @param reader
   */
  public render(
    reader: IReader<E, F>,
    formData: IForm<F> = null
  ): Promise<IForm<F>> {
    return new Promise(async (resolve) => {
      let updateMaps = false;

      if (formData) {
        this._formData = formData;
      } else {
        this._formData = await reader.read(this._entity);
      }

      //initializer
      if (this._formData.initializer) {
        this._formData = await this._formData.initializer(
          this._formData,
          this._entity
        );

        //reset items map
        this._formData.itemsMap = {};
        updateMaps = true;
      }

      //set update values
      this._formData.items.forEach((item: F, index: number) => {
        item.updateValue = this.updateValue;
        item.updatePropertyValue = this.updatePropertyValue;
        item.getInitialEntity = this.getInitialEntity;

        if (updateMaps) {
          this._formData.itemsMap[item.property] = index;
        }
      });

      resolve(this._formData);
    });
  }

  /**
   *
   * @param reader
   * @returns
   */
  public getEntity(): Promise<E> {
    return new Promise(async (resolve) => {
      const { items } = this._formData;
      const entity = { ...this._entity };

      await items.forEach((item: F) => {
        const { property, value, propertyPath } = item;
        let writePath = property;

        if (propertyPath) {
          writePath = propertyPath;
        }

        WriteToPropertyPath(entity, writePath, value);
      });

      resolve(entity);
    });
  }

  /**
   *
   * @returns
   */
  public validate(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const { items } = this._formData;
      this._hasError = false;

      await items.forEach(async (item: F) => {
        const { errorChecking, hidden } = item;

        if (errorChecking == null) {
          return;
        }

        if (!hidden) {
          return;
        }
        const { error, errorMessage } = await errorChecking({
          formItem: item,
          readItems: this.readItems,
          entity: this._entity
        });

        if (error) {
          this._hasError = true;
        }

        item.error = error;
        item.errorMessage = errorMessage;
      });

      this.fireEvent(FormEvents.UPDATE, this._formData);

      resolve(this._hasError);
    });
  }

  /**
   *
   */
  public reset(): void {
    this._formData.items.forEach((formItem: F) => {
      formItem.value = formItem.defaultValue;
    });

    this.fireEvent(FormEvents.UPDATE, this._formData);
  }

  /**
   *
   * @param formItemKey
   * @param property
   * @param data
   */
  public updatePropertyValue(
    formItemKey: string,
    property: string,
    data: any
  ): void {
    const map = this.readItems([formItemKey]);
    const formItem = map.get(formItemKey);

    formItem[property] = data;

    this.writeItems([formItem]);
    this.fireEvent(FormEvents.UPDATE, this._formData);
  }

  /**
   * @returns
   */
  public submitControl(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const { items } = this._formData;

      await items.forEach(async (item: F) => {
        const { submit } = item;

        if (submit) {
          await submit({
            formItem: item,
            readItems: this.readItems,
            entity: this._entity
          });
        }
      });

      resolve(true);
    });
  }

  /**
   *
   * @returns
   */
  public getInitialEntity(): IEntity {
    return this._entity;
  }

  /**
   *
   * @param formItemKey
   * @param value
   */
  abstract updateValue(formItemKey: string, value: any): void;
}
